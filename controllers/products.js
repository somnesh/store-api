const Product = require("../models/product");

const getAllProductsStatic = async (req, res) => {
  const data = await Product.find({}).select("name price").limit(2);
  res.json({ data, nbHits: data.length });
};

const getAllProducts = async (req, res) => {
  const { featured, company, name, sort, attributes, numericFilter } =
    req.query;

  const queryObject = {};
  if (numericFilter) {
    const operatorMap = {
      ">": "$gt",
      ">=": "$gte",
      "=": "$eq",
      "<": "$lt",
      "<=": "$lte",
    };
    const regEx = /\b(<|>|>=|=|<|<=)\b/g;
    let filters = numericFilter.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    );
    const options = ["price", "rating"];
    filters = filters.split(",").forEach((item) => {
      const [field, operator, value] = item.split("-");
      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
      }
    });
  }

  if (featured) {
    queryObject.featured = featured === "true" ? true : false;
  }

  if (company) {
    queryObject.company = company;
  }

  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }

  let result = Product.find(queryObject);
  if (sort) {
    const sortList = sort.split(",").join(" ");
    result = result.sort(sortList);
  } else {
    result = result.sort("createdAt");
  }

  if (attributes) {
    const attributesList = attributes.split(",").join(" ");
    result = result.select(attributesList);
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const data = await result;
  res.status(200).json({ data, nbHits: data.length });
};

module.exports = {
  getAllProducts,
  getAllProductsStatic,
};
