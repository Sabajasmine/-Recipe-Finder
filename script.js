const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const randomBtn = document.getElementById("random-btn");
const mealsContainer = document.getElementById("meals");
const resultHeading = document.getElementById("result-heading");
const errorContainer = document.getElementById("error-container");
const mealDetails = document.getElementById("meal-details");
const mealDetailsContent = document.querySelector(".meal-details-content");
const backBtn = document.getElementById("back-btn");

const categoryFilter = document.getElementById("category-filter");
const areaFilter = document.getElementById("area-filter");

const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";

// EVENTS
searchBtn.addEventListener("click", searchMeals);
randomBtn.addEventListener("click", getRandomMeal);
mealsContainer.addEventListener("click", handleMealClick);
backBtn.addEventListener("click", () => mealDetails.classList.add("hidden"));
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchMeals();
});
categoryFilter.addEventListener("change", filterByCategory);
areaFilter.addEventListener("change", filterByArea);

// FUNCTIONS
async function searchMeals() {
  const term = searchInput.value.trim();
  if (!term) return showError("Please enter a search term");

  try {
    const res = await fetch(`${BASE_URL}search.php?s=${term}`);
    const data = await res.json();
    if (!data.meals) {
      showError(`No recipes found for "${term}"`);
      return;
    }
    resultHeading.textContent = `Results for "${term}"`;
    displayMeals(data.meals);
  } catch {
    showError("Something went wrong. Try again.");
  }
}

async function getRandomMeal() {
  try {
    const res = await fetch(`${BASE_URL}random.php`);
    const data = await res.json();
    resultHeading.textContent = "Random Recipe";
    displayMeals(data.meals);
  } catch {
    showError("Failed to load random recipe");
  }
}

function displayMeals(meals) {
  errorContainer.classList.add("hidden");
  mealsContainer.innerHTML = meals
    .map(
      (meal) => `
    <div class="meal" data-meal-id="${meal.idMeal}">
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <div class="meal-info">
        <h3>${meal.strMeal}</h3>
        <div class="meal-category">${meal.strCategory || ""}</div>
      </div>
    </div>`
    )
    .join("");
}

async function handleMealClick(e) {
  const mealEl = e.target.closest(".meal");
  if (!mealEl) return;

  const mealId = mealEl.dataset.mealId;
  const res = await fetch(`${BASE_URL}lookup.php?i=${mealId}`);
  const data = await res.json();
  if (data.meals) showMealDetails(data.meals[0]);
}

function showMealDetails(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    if (meal[`strIngredient${i}`]) {
      ingredients.push(`${meal[`strMeasure${i}`]} ${meal[`strIngredient${i}`]}`);
    }
  }

  mealDetailsContent.innerHTML = `
    <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="meal-details-img">
    <h2 class="meal-details-title">${meal.strMeal}</h2>
    <p><strong>Category:</strong> ${meal.strCategory || "N/A"}</p>
    <p><strong>Area:</strong> ${meal.strArea || "N/A"}</p>
    <div class="meal-details-instructions">
      <h3>Instructions</h3>
      <p>${meal.strInstructions}</p>
    </div>
    <div class="meal-details-ingredients">
      <h3>Ingredients</h3>
      <ul class="ingredients-list">
        ${ingredients.map((ing) => `<li>🍴 ${ing}</li>`).join("")}
      </ul>
    </div>
    ${
      meal.strYoutube
        ? `<a href="${meal.strYoutube}" target="_blank" class="youtube-link"><i class="fab fa-youtube"></i> Watch on YouTube</a>`
        : ""
    }
  `;
  mealDetails.classList.remove("hidden");
  mealDetails.scrollIntoView({ behavior: "smooth" });
}

function showError(msg) {
  errorContainer.textContent = msg;
  errorContainer.classList.remove("hidden");
  mealsContainer.innerHTML = "";
  resultHeading.textContent = "";
}

// FILTERS
async function loadFilters() {
  try {
    const catRes = await fetch(`${BASE_URL}list.php?c=list`);
    const catData = await catRes.json();
    catData.meals.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.strCategory;
      opt.textContent = c.strCategory;
      categoryFilter.appendChild(opt);
    });

    const areaRes = await fetch(`${BASE_URL}list.php?a=list`);
    const areaData = await areaRes.json();
    areaData.meals.forEach((a) => {
      const opt = document.createElement("option");
      opt.value = a.strArea;
      opt.textContent = a.strArea;
      areaFilter.appendChild(opt);
    });
  } catch {
    console.error("Filters failed to load");
  }
}

async function filterByCategory(e) {
  if (!e.target.value) return;
  const res = await fetch(`${BASE_URL}filter.php?c=${e.target.value}`);
  const data = await res.json();
  resultHeading.textContent = `Category: ${e.target.value}`;
  displayMeals(data.meals);
}

async function filterByArea(e) {
  if (!e.target.value) return;
  const res = await fetch(`${BASE_URL}filter.php?a=${e.target.value}`);
  const data = await res.json();
  resultHeading.textContent = `Cuisine: ${e.target.value}`;
  displayMeals(data.meals);
}

// INIT
loadFilters();
