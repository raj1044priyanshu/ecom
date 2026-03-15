import { parse } from 'csv-parse/sync';
import slugify from 'slugify';
import Product from '../models/Product.js';
import { flushCache } from '../utils/cache.js';

const CSV_COLUMNS = ['name', 'price', 'discountPrice', 'category', 'brand', 'stock', 'description', 'tags', 'isFeatured', 'images'];

/**
 * Map a raw CSV row object to a Product-ready object.
 * Validates required fields and coerces types.
 */
const mapRowToProduct = (row, index, sellerId) => {
  const errors = [];
  if (!row.name || (typeof row.name === 'string' && !row.name.trim())) errors.push(`Row ${index + 2}: "name" is required`);
  if (row.price === undefined || row.price === null || isNaN(Number(row.price))) errors.push(`Row ${index + 2}: "price" must be a valid number`);
  if (!row.category || (typeof row.category === 'string' && !row.category.trim())) errors.push(`Row ${index + 2}: "category" is required`);
  if (row.stock === undefined || row.stock === null || isNaN(Number(row.stock))) errors.push(`Row ${index + 2}: "stock" must be a valid number`);
  if (errors.length) return { errors };

  return {
    product: {
      name: typeof row.name === 'string' ? row.name.trim() : String(row.name),
      slug: slugify(typeof row.name === 'string' ? row.name.trim() : String(row.name), { lower: true, strict: true }),
      price: Number(row.price),
      discountPrice: row.discountPrice ? Number(row.discountPrice) : undefined,
      category: typeof row.category === 'string' ? row.category.trim() : String(row.category),
      brand: typeof row.brand === 'string' ? row.brand.trim() : (row.brand ? String(row.brand) : ''),
      stock: Number(row.stock),
      description: typeof row.description === 'string' ? row.description.trim() : (row.description ? String(row.description) : ''),
      tags: typeof row.tags === 'string' ? row.tags.split(';').map((t) => t.trim()).filter(Boolean) : (Array.isArray(row.tags) ? row.tags : []),
      isFeatured: row.isFeatured === true || String(row.isFeatured).toLowerCase() === 'true',
      images: typeof row.images === 'string' 
        ? row.images.split(';').map(url => ({ url: url.trim(), public_id: 'external' })).filter(img => img.url)
        : (Array.isArray(row.images) ? row.images.map(url => typeof url === 'string' ? ({ url, public_id: 'external' }) : url) : []),
      seller: sellerId,
    },
  };
};

/**
 * POST /products/bulk-csv
 * Upload a CSV file to bulk-create products.
 * CSV must have header row: name,price,discountPrice,category,brand,stock,description,tags
 */
export const bulkImportCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No CSV file uploaded.' });
    }

    const csv = req.file.buffer.toString('utf-8');
    let records;
    try {
      records = parse(csv, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
      });
    } catch (parseErr) {
      return res.status(400).json({ success: false, message: `CSV parse error: ${parseErr.message}` });
    }

    if (records.length === 0) {
      return res.status(400).json({ success: false, message: 'CSV file is empty or has no data rows.' });
    }

    const allErrors = [];
    const validProducts = [];

    records.forEach((row, i) => {
      const result = mapRowToProduct(row, i, req.user._id);
      if (result.errors) allErrors.push(...result.errors);
      else validProducts.push(result.product);
    });

    if (allErrors.length > 0 && validProducts.length === 0) {
      return res.status(400).json({ success: false, message: 'All rows had errors.', errors: allErrors });
    }

    const inserted = await Product.insertMany(validProducts, { ordered: false });
    flushCache();

    res.status(201).json({
      success: true,
      message: `Successfully imported ${inserted.length} products.`,
      imported: inserted.length,
      skipped: allErrors.length,
      errors: allErrors.length > 0 ? allErrors : undefined,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /products/bulk-json
 * Accept a JSON array of products to bulk-create.
 * Body: { products: [ { name, price, category, stock, ... }, ... ] }
 */
export const bulkImportJSON = async (req, res, next) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: '`products` must be a non-empty array.' });
    }

    const allErrors = [];
    const validProducts = [];

    products.forEach((row, i) => {
      const result = mapRowToProduct(row, i, req.user._id);
      if (result.errors) allErrors.push(...result.errors);
      else validProducts.push(result.product);
    });

    if (validProducts.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid products found.', errors: allErrors });
    }

    const inserted = await Product.insertMany(validProducts, { ordered: false });
    flushCache();

    res.status(201).json({
      success: true,
      message: `Successfully imported ${inserted.length} products.`,
      imported: inserted.length,
      skipped: allErrors.length,
      errors: allErrors.length > 0 ? allErrors : undefined,
    });
  } catch (error) {
    next(error);
  }
};

/** Return a sample CSV template as plain text */
export const getCSVTemplate = (req, res) => {
  const header = CSV_COLUMNS.join(',');
  const sample1 = 'Sample Phone,29999,24999,Electronics,Samsung,50,A great smartphone,phone;android;samsung,true';
  const sample2 = 'Cotton T-Shirt,599,,Fashion,H&M,200,Comfortable daily wear,fashion;casual;cotton,false';
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="ecom_products_template.csv"');
  res.send(`${header}\n${sample1}\n${sample2}\n`);
};
