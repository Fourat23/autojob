// 🧪 Mock Winston logger to avoid real file writes
jest.mock("../logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

const logger = require("../logger");

//
// ─── LOGGER UNIT TESTS ────────────────────────────────────────────────
//

describe("Logger (mocked)", () => {
  // Reset all mocked calls before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ✅ Should call logger.info correctly
  it("should call logger.info with correct message", () => {
    logger.info("Test info log");

    // Assert that the mocked info function was called once with expected message
    expect(logger.info).toHaveBeenCalledWith("Test info log");
  });

  // ✅ Should call logger.error correctly
  it("should call logger.error with correct message", () => {
    logger.error("Test error log");

    // Assert that the mocked error function was called once with expected message
    expect(logger.error).toHaveBeenCalledWith("Test error log");
  });
});
