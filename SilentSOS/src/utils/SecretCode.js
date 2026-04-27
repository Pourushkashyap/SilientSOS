export const checkSequence = (key, buffer = "", cancelCode = "9999=") => {
  try {
    const SETUP_CODE = "2580=";

    const safeBuffer = buffer || "";

    const isSetupCode = safeBuffer.endsWith(SETUP_CODE);
    const isCancelCode = safeBuffer.endsWith(cancelCode);

    return { isSetupCode, isCancelCode };

  } catch (err) {
    console.log("Sequence check error:", err);
    return { isSetupCode: false, isCancelCode: false };
  }
};