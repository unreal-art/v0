import axios from "axios";
import https from "https";
import appConfig from "@/config";

const agent = new https.Agent({
  rejectUnauthorized: false, // Disable SSL verification
  ca: `-----BEGIN CERTIFICATE-----
MIIDtTCCAp2gAwIBAgIUOtTgT7SuASjWkIn/ujXWltfZL0UwDQYJKoZIhvcNAQEL
BQAwajELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxEzARBgNVBAoM
CkRlY2VudGVyQUkxDTALBgNVBAMMBEhpcm8xIjAgBgkqhkiG9w0BCQEWE2hpcm9A
ZGVjZW50ZXJhaS5jb20wHhcNMjQxMjIzMDI1NzQ4WhcNMjUxMjIzMDI1NzQ4WjBq
MQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTETMBEGA1UECgwKRGVj
ZW50ZXJBSTENMAsGA1UEAwwESGlybzEiMCAGCSqGSIb3DQEJARYTaGlyb0BkZWNl
bnRlcmFpLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAJg/WFBA
H9RaiD3toJjTgY+kXuJecxgxq63oUx0wD9mk57QRP/CPcs0eLiezVmvDBr4fVGit
cFwQribNKPEt9O9k3EN8e6ywvNO/3sUybGDYjpD08s68UiMI7Jeybk63nFGUY2oF
ZgkS2nffZATtUhVhvwxl1b6H6jtg7Ts5bZ1c6JJ6kdwefEYpUxdElkXWyH7hV1Dc
2tCOHI3RLm788wX/1AZYJOH9+neh7Jwa26tF04pkjGO8G98MCgcne8I9j5IjQjki
QsNd2lRLDW2+///Y6Y/HTeGymb0xg8ZLaWRRB4+nVSS+aRitTmPkvnRL9WlUh6xF
N+b3lcQt1T8p+BsCAwEAAaNTMFEwHQYDVR0OBBYEFD22hDmAffWveLhzkfLm0P5o
tn8tMB8GA1UdIwQYMBaAFD22hDmAffWveLhzkfLm0P5otn8tMA8GA1UdEwEB/wQF
MAMBAf8wDQYJKoZIhvcNAQELBQADggEBACmztJPRHrzLwhOdgUFid4eUz3TEiV4y
W3+oV9FJX/xPjHIdtehxWL3Fx64sc4MAMutA3lP04mK6BsWKmI04SVHoJ4FCv2Ww
sxjLWnvGxGMzCPdb1utcVjmDyL+3o4h0UEgYDhWMGMl0iILmKGBQ7qnfMy3nsgDy
Y7n1LfRMuwwZcNzTrq4OjpKBjAKPZMy1NZR9cuMEw+fVQOiM4afdsJSt/DOl+aY2
XmIP1S6gHygY805JVAjoGlEv4SYgsJt97/61xZgWZQh8N3PSFn1zR3lbZ3JpDLN2
lQ7Ghuq6/cFOhwmhdh2zUf8x/N8lzzeZqPdy3DYVGPmPyKOAPRsq69s=
-----END CERTIFICATE-----`.trim(),
});

export const axiosInstance = axios.create({
  baseURL: appConfig.services.api.url, // Base URL
  // headers: {
  //   "Content-Type": "application/json",
  // },
  timeout: 0,
  timeoutErrorMessage: "Axios timed out",
  // timeout: 1000*60*5, // 5 minutes
  // httpsAgent: agent, // Allow self-signed SSL
});

export const axiosInstanceLocal = axios.create({
  baseURL: "/",
  // headers: { "Content-Type": "application/json" },
  // httpsAgent: agent, // Allow self-signed SSL
});
