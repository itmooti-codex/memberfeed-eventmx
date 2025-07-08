
// export default {
//     API_KEY: graphQlApiKey,
//     PARAM: awsS3Param,
//     PARAM_URL: awsS3ParamUrl,
//     HTTP_ENDPOINT: graphQlApiEndpoint,
//     WS_ENDPOINT: graphQlWsEndpoint,
// };

//
//
const API_KEY = "lZirodvxO8LO6cD1QnA7C";
const HTTP_ENDPOINT = "https://eventmx.vitalstats.app/api/v1/graphql";
const WS_ENDPOINT = `wss://eventmx.vitalstats.app/api/v1/graphql?apiKey=${API_KEY}`;
const PARAM = "a4f53007447caa877beabc29e8790226";
const PARAM_URL = "https://eventmx.app/s/aws";

export default {
    API_KEY,
    HTTP_ENDPOINT,
    WS_ENDPOINT,
    PARAM,
    PARAM_URL
};