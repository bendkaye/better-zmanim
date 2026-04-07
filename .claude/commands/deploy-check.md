# Post-Deploy Verification

$ARGUMENTS

1. Check the health endpoint: `curl https://api.betterzmanim.com/health`
2. Verify the version matches the expected release tag
3. Test zmanim endpoint: `curl "https://api.betterzmanim.com/api/zmanim?lat=40.71&lng=-74.01&date=$(date +%Y-%m-%d)"`
4. Test geocode endpoint: `curl "https://api.betterzmanim.com/api/geocode?q=jerusalem"`
5. Verify web app loads: check https://betterzmanim.com
6. Check Cloudflare dashboard for error rate spikes
7. Report status: ✅ Deploy verified OR ❌ Issues found (with details)