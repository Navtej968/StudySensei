"use strict";

var _nodeFs = _interopRequireDefault(require("node:fs"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _db = _interopRequireDefault(require("./db"));
var _category = _interopRequireDefault(require("../models/category"));
var _subcategory = _interopRequireDefault(require("../models/subcategory"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
_dotenv.default.config();

/**
   * Add categories to database from an excel or csv file
   * @param {string} file - filepath to categories file
   */
async function addCategories(file) {
  if (!_nodeFs.default.existsSync(file)) {
    console.error("Categories file doesn't exist");
    return;
  }
  const saveDocuments = [];
  const data = _nodeFs.default.readFileSync(file).toString('utf-8');
  const categories = data.split('\n');
  for (const category of categories.slice(1, categories.length - 1)) {
    const newCategory = new _category.default({
      title: category
    });
    saveDocuments.push(newCategory.save());
  }
  await Promise.all(saveDocuments);
}

/**
   * Add subcategories to database from an excel or csv file
   * @param {string} file - filepath to subcategories file
   */
async function addSubcategories(file) {
  if (!_nodeFs.default.existsSync(file)) {
    console.error("Subcategories file doesn't exist");
    return;
  }
  const saveDocuments = [];
  const data = _nodeFs.default.readFileSync(file).toString('utf-8');
  const subcategories = data.split('\n');
  for (const subcategory of subcategories.slice(1, subcategories.length - 1)) {
    const [title, categoryTitle, keywords] = subcategory.split(',');
    // eslint-disable-next-line no-await-in-loop
    const category = await _category.default.findOne({
      title: categoryTitle
    });
    if (category) {
      const newSubcategory = new _subcategory.default({
        title,
        category,
        keywords: keywords.split(';').map(keyword => keyword.toLowerCase())
      });
      saveDocuments.push(newSubcategory.save());
    }
  }
  await Promise.all(saveDocuments);
}

/**
 * Populates database with categories and subcategories from csv files
 */
async function loadCategories() {
  const categoriesFile = './shared/course_categories.csv';
  const subCategoriesFile = './shared/course_subcategories.csv';
  try {
    await _db.default.connect();
    await _category.default.deleteMany({});
    await _subcategory.default.deleteMany({});
    await addCategories(categoriesFile);
    await addSubcategories(subCategoriesFile);
  } catch (error) {
    console.error(error);
  }
}
loadCategories().then(() => process.exit());