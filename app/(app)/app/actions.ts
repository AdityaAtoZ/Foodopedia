"use server";
import { NutritionProps, NutrientProps } from "@/types";
import { checkBarcodeFormat, convertMetric, getAdditivesAmount, getRateIndex, rateProduct, verifyNutrient } from "@/utils";
import { PrismaClient, ProductNutrients, Products } from "@prisma/client";


export async function getProducts(page: number = 1, limit: number = 10): Promise<Products[] | null>
{
  try {
    const prisma = new PrismaClient();
    const products = await prisma.products.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: "desc" }
    }).catch((error) => {
      console.log('Database error:', error);
      return [];
    }).finally(() => {
      prisma.$disconnect();
    });

    // If no products found and database is working, return empty array
    if (products && products.length > 0) {
      return products;
    }

    // Return test data if no database connection
    return [];

  } catch (error) {
    console.log('Database connection error:', error);
    return [];
  }
}

export async function getProduct(barcode: string): Promise<Products | null>
{
  try {
    const prisma = new PrismaClient();
    return await prisma.products.findUnique({
      where: { barcode: barcode }
    }).catch((error) => {
      console.log('Database error:', error);
      return null;
    }).finally(() => {
      prisma.$disconnect();
    });

  } catch (error) {
    console.log('Database connection error:', error);
    return null;
  }  
}

export async function getProductNutrients(productID: string): Promise<ProductNutrients[] | null>
{
  try {
    const prisma = new PrismaClient();
    return await prisma.productNutrients.findMany({
      where: { productID },
      orderBy: { rated: "desc" }
    }).catch((error) => {
      console.log(error);
      return null;
    }).finally(() => {
      prisma.$disconnect();
    });

  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function checkProduct(barcode: string): Promise<Products | null>
{
  try {
    // Check if barcode all digits are numbers with 8 to 13 digits
    if ( !checkBarcodeFormat(barcode) )
      throw new Error("Barcode format error: Please enter a valid barcode.")

    // Check database for product if exists
    let product: Products | null = await getProduct(barcode);
    if ( product !== null )
      return product;

    // Fetch from Open Food Facts Org. API
    let newProduct: NutritionProps | null = null;
    newProduct = await fetchFromOpenFoodFacts(barcode);

    if( newProduct === null )
      throw new Error(`Product with barcode ${barcode} not found in OpenFoodFacts database. Please try a different barcode or check if the product exists.`);

    // Analyze, rate and insert new product with all related nutrients into database
    let { nutrients } = newProduct;
    
    if ( nutrients.length === 0 )
      throw new Error("Product doesn't have any nutrients.");
    
    const ratedNutrients: NutrientProps[] = [];
    nutrients.forEach((nutrient) => {
      // Verify and get nutrient metric object
      let metric = verifyNutrient(nutrient);
      if ( metric === null ) return;

      // ADDITIVES: If nutrient name is "additives" then do different things
      if ( nutrient.name === "additives" ) {
        nutrient.amount = getAdditivesAmount( nutrient.unitName.split(" "), metric );
      }
  
      // Convert nutrient amount to match the benchmarks' unit
      nutrient.amount = convertMetric( nutrient.amount, nutrient.unitName, metric.benchmarks_unit );
      if ( metric.benchmarks_unit !== '' )
        nutrient.unitName = metric.benchmarks_unit;
  
      // Find the rate of nutrient amount
      nutrient.rate = metric.rates[ getRateIndex( nutrient.amount, metric ) ];

      ratedNutrients.push( nutrient );
    });
    newProduct.nutrients = ratedNutrients;

    let productRate = rateProduct(ratedNutrients);

    // Try to save to database, but don't fail if database is not available
    try {
      const prisma = new PrismaClient();
      let res = await prisma.products.create({
        data: {
          barcode: barcode,
          name: newProduct.name,
          image: newProduct.image,
          brandOwner: newProduct.brandOwner,
          brandName: newProduct.brandName,
          ingredients: newProduct.ingredients,
          servingSize: newProduct.servingSize,
          servingUnit: newProduct.servingSizeUnit,
          packageWeight: newProduct.packageWeight,
          rated: productRate,
          nutrients: {
            create: newProduct.nutrients.map((nutrient) => {
              return {
                nameKey: nutrient.name,
                amount: nutrient.amount,
                unitName: nutrient.unitName,
                rated: nutrient.rate || 0,
              }
            })
          }
        }
      });

      if ( res === null )
        throw new Error("Error while inserting product into database.");
      
      return await getProduct(barcode);
    } catch (dbError) {
      console.log('Database not available, returning product without saving:', dbError);
      // Return a mock product for testing when database is not available
      return {
        id: 'temp-' + Date.now(),
        barcode: barcode,
        name: newProduct.name,
        image: newProduct.image,
        brandOwner: newProduct.brandOwner,
        brandName: newProduct.brandName,
        ingredients: newProduct.ingredients,
        servingSize: newProduct.servingSize,
        servingUnit: newProduct.servingSizeUnit,
        packageWeight: newProduct.packageWeight,
        rated: productRate,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Products;
    }

  } catch (error) {
    console.log('Error in checkProduct:', error);
    return null;
  }
}

export async function fetchFromOpenFoodFacts(barcode: string): Promise<any> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const result = await fetch(`${apiUrl}/api/scan?barcode=${encodeURIComponent(barcode)}`);
    
    if (!result.ok) {
      console.error(`Failed to fetch product with barcode: ${barcode}`);
      return null;
    }
    
    const productData = await result.json();
    
    if (!productData || productData.error) {
      console.error(`Product not found: ${barcode}`);
      return null;
    }
    
    return createNutritionObjectFromOpenFoodFacts(productData);
  } catch (error) {
    console.error('Error fetching from OpenFoodFacts:', error);
    return null;
  }
}

export async function createNutritionObjectFromOpenFoodFacts(json: any): Promise<NutritionProps | null> {

  // Parse "1 oz (28 g)" | "123 lb" | "1 g" | "3.432mg" to array of value number and unit string
  const parseServingSize = (servingSize: string): [number, string] => {
    if (!servingSize) return [0, ""];
    
    const regex = /\((.*)\)/;
    const match = servingSize.match(regex);
    if( match !== null )
      servingSize = match[1];  

    let matches = servingSize.match(/(\d+(\.\d+)?)\s*([a-zA-Z]+)/);
    if( matches !== null )
      return [ parseFloat(matches[1]), matches[3] ];
    else
      return [ 0, "" ];
  };

  try {
    let additivesArray: string[] = getAdditives(json.additives_tags || []);
    let additivesString: string = additivesArray.join(" ");

    const nutritionObject: NutritionProps = {
      id: json._id || json.id || "",
      image: json.image_url || json.image_front_url || "/no-image.webp",
      name: json.product_name || json.product_name_en || "",
      brandOwner: json.brand_owner || "",
      brandName: json.brands || "",
      ingredients: json.ingredients_text || json.ingredients_text_en || "",
      servingSize: parseServingSize(json.serving_size || "")[0],
      servingSizeUnit: parseServingSize(json.serving_size || "")[1],
      packageWeight: json.product_quantity || "",
      additives: additivesArray,
      nutrients: [],
    };

    let nutrientsIdCounter = 0;
    
    // Handle nutriments data
    if (json.nutriments) {
      Object.keys(json.nutriments).filter((key) => {
        if ( !/[_]/.test(key) && json.nutriments[key] !== undefined && json.nutriments[key] !== null )
        {
          nutritionObject.nutrients.push({
            id: ++nutrientsIdCounter,
            name: key,
            code: "",
            amount: json.nutriments[key] || 0,
            unitName: json.nutriments[key+"_unit"] || "",
          });
        }
      });
    }

    // Add additives to nutrients list if exists
    if ( json.additives_tags !== undefined && json.additives_tags.length > 0 )
    {
      nutritionObject.nutrients.push({
        id: ++nutrientsIdCounter,
        name: "additives",
        code: "",
        amount: additivesArray.length,
        unitName: additivesString,
      });
    }

    return nutritionObject;
  } catch (error) {
    console.error('Error creating nutrition object:', error);
    return null;
  }
}

function getAdditives(additives: string[]): string[] {
  const additivesList: string[] = [];
  additives.forEach((a) => {
    if (a.startsWith('en:')) {
      a = a.replace('en:', '');
      additivesList.push( a.toUpperCase() );
    }
  });
  return additivesList;
}