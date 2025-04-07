const db = require("../db");

describe("🧪 DB connection", () => {
  it("should execute a simple SELECT 1 query", async () => {
    const result = await db.query("SELECT 1 as value");
    expect(result.rows[0].value).toBe(1);

    // Cleanly close the pool to avoid open handles
    await db.end();
  }, 10000); // 10s timeout
});
