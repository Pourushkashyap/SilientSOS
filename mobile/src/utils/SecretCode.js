export const checkSequence = (key, buffer) => {
  // Normally cancelCode would be pulled dynamically, but we pass buffer
  const SETUP_CODE = "2580=";
  const CANCEL_CODE = "9999=";

  const isSetupCode = buffer.endsWith(SETUP_CODE);
  const isCancelCode = buffer.endsWith(CANCEL_CODE);

  return { isSetupCode, isCancelCode };
};
