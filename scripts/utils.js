export function logMsg(msg, feature, featureItem) {
  if (!msg) return;
  const logMsg = (feature && featureItem) ? `w15ps-compendia | ${feature} (${featureItem}): ${msg}` :
    (feature) ? `w15ps-compendia | ${feature}: ${msg}` :
    `w15ps-compendia | ${msg}`
  console.log(logMsg);
}