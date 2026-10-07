// Protected Preview access uses the CLI's short-lived credential in memory only.
// Scope the header to the exact tested origin; never attach it to third-party requests.
exports.attachPreviewAccess=browser=>{
 const origin=process.env.QA_BASE_URL,token=process.env.VERCEL_OIDC_TOKEN;
 if(!origin||!token)return;
 const create=browser.newContext.bind(browser);
 browser.newContext=async options=>{
  const context=await create(options);
  await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue({headers:{...route.request().headers(),'x-vercel-trusted-oidc-idp-token':token}}):route.abort());
  return context;
 };
};
