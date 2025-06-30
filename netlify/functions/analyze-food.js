// A simple fallback parser when the full AI analysis isn't needed or available.
function simpleFoodParser(description) {
  const lowerDesc = description.toLowerCase();
  
  // Extract quantity and food name
  const quantityMatch = lowerDesc.match(/(\d+(?:\.\d+)?)\s*(?:cups?|pieces?|slices?|ounces?|oz|grams?|g|lbs?|pounds?|tablespoons?|tbsp|teaspoons?|tsp|servings?|portions?)?/);
  const quantity = quantityMatch ? quantityMatch[0] : '1 serving';
  
  // Remove quantity from food name
  let foodName = description.replace(quantityMatch?.[0] || '', '').trim();
  if (foodName.startsWith('of ')) {
    foodName = foodName.substring(3);
  }
  
  // Determine meal type based on time or keywords
  const currentHour = new Date().getHours();
  let mealType = 'snack';
  
  if (lowerDesc.includes('breakfast') || (currentHour >= 6 && currentHour < 11)) {
    mealType = 'breakfast';
  } else if (lowerDesc.includes('lunch') || (currentHour >= 11 && currentHour < 16)) {
    mealType = 'lunch';
  } else if (lowerDesc.includes('dinner') || (currentHour >= 16 && currentHour < 22)) {
    mealType = 'dinner';
  }
  
  return {
    food_name: foodName || 'Unknown food',
    quantity,
    meal_type: mealType,
  };
}


exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const { description } = JSON.parse(event.body);

  if (!description) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Description is required.' }),
    };
  }
  
  // For now, we'll use the simple parser.
  // This could be enhanced with a Groq call in the future.
  const analysis = simpleFoodParser(description);

  return {
    statusCode: 200,
    body: JSON.stringify({ analysis }),
  };
}; 