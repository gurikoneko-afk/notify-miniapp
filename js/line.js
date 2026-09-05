const LIFF_ID = '2011459717-DgyR41pJ';

async function initLine() {
  try {
    await liff.init({
      liffId: LIFF_ID,
    });

    return {
      isLoggedIn: liff.isLoggedIn(),
      isInClient: liff.isInClient(),
      idToken: liff.getIDToken(),
    };
  } catch (error) {
    console.error('LIFF init failed:', error);
    throw error;
  }
}
