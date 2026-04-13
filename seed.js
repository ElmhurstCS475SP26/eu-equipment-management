require("dotenv").config();
const XLSX = require("xlsx");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function cleanString(value) {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str === "" ? null : str;
}

function cleanInt(value) {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

function normalizeStatus(value) {
  const status = cleanString(value);
  if (!status) return "available";
  const lower = status.toLowerCase();
  if (lower === "checkedout" || lower === "checked out" || lower === "checked_out") {
    return "checked_out";
  }
  if (lower === "returned") {
    return "available";
  }
  return lower;
}

async function importKits() {
  const workbook = XLSX.readFile("/Users/marionkrowczyk/Desktop/digital-media-checkout/data/kits.xlsx");
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

  let count = 0;
  for (const row of rows) {
    const externalId = cleanString(row["id"]);
    if (!externalId) continue;

    await prisma.kit.upsert({
      where: { externalId },
      update: {
        name: cleanString(row["name"]) || "Unnamed Kit",
        status: normalizeStatus(row["status"]),
      },
      create: {
        externalId,
        name: cleanString(row["name"]) || "Unnamed Kit",
        status: normalizeStatus(row["status"]),
      },
    });
    count++;
  }
  console.log(`✅ Kits imported successfully: ${count}`);
}

async function importItems() {
  const workbook = XLSX.readFile("/Users/marionkrowczyk/Desktop/digital-media-checkout/data/items.xlsx");
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

  let count = 0;
  for (const row of rows) {
    const externalId = cleanString(row["Id"]);
    if (!externalId) continue;

    const barcode = cleanString(row["Barcodes"]);
    const quantity = cleanInt(row["Quantity"]);
    const imageUrl = cleanString(row["Image Url"]);
    const kitExternalId = cleanString(row["Kit"]);

    try {
      await prisma.item.upsert({
        where: { externalId },
        update: {
          name: cleanString(row["Name"]) || "Unknown Item",
          category: cleanString(row["Category"]) || "General",
          status: cleanString(row["Status"]) || "available",
          brand: cleanString(row["Brand"]),
          model: cleanString(row["Model"]),
          quantity: quantity,
          kind: cleanString(row["Kind"]),
          description: cleanString(row["Codes"]),
          imageUrl: imageUrl,
          barcode: barcode,
          location: cleanString(row["Location"]),
          cheqroomKitId: kitExternalId,
        },
        create: {
          externalId: externalId,
          name: cleanString(row["Name"]) || "Unknown Item",
          category: cleanString(row["Category"]) || "General",
          status: cleanString(row["Status"]) || "available",
          brand: cleanString(row["Brand"]),
          model: cleanString(row["Model"]),
          quantity: quantity,
          kind: cleanString(row["Kind"]),
          description: cleanString(row["Codes"]),
          imageUrl: imageUrl,
          barcode: barcode,
          location: cleanString(row["Location"]),
          cheqroomKitId: kitExternalId,
        },
      });
      count++;
    } catch (e) {
      console.warn(`Skipping item ${externalId} due to error: ${e.meta?.driverAdapterError || e.message}`);
    }
  }
  console.log(`✅ Items imported successfully: ${count}`);
}

async function linkItemsKits() {
  const items = await prisma.item.findMany({
    where: {
      cheqroomKitId: {
        not: null,
      },
    },
  });

  let linkedCount = 0;
  for (const item of items) {
    const kit = await prisma.kit.findUnique({
      where: {
        externalId: item.cheqroomKitId,
      },
    });

    if (kit) {
      await prisma.item.update({
        where: { id: item.id },
        data: { kitId: kit.id },
      });
      linkedCount++;
    }
  }
  console.log(`✅ Linked ${linkedCount} items to kits`);
}

async function main() {
  await importKits();
  await importItems();
  await linkItemsKits();
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
