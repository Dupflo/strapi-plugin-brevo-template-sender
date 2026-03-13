import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Box, Flex, Typography, Button, Alert, Field, TextInput, Modal, Table, Thead, Tr, Th, Tbody, Td, Checkbox, Loader } from "@strapi/design-system";
import { useFetchClient } from "@strapi/strapi/admin";
import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { useIntl } from "react-intl";
import { Star } from "@strapi/icons";
import styled from "styled-components";
const bmcButtonImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAiEAAACZCAMAAADOzxqEAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAIRQTFRFw6kJSkAahnUS8NACHBkhpI8N4cME/+ZAhnUROjMcKyYfaFoW0rYHlYIPs5wLWU0Yd2cUHBkg//e/aFoVd2cTKyYe0rYG/98Q/+6AWU0X//vf//3v/+Eg//CP/+Mw//Sv/+pg//nP/+xw//Kf/+hQ/+5///a/DQwiDQwj/////90A////A0MgiAAAACx0Uk5T/////////////////////////////////////////////////////////wDH1gmMAAARpUlEQVR42uydaWPiOAyGfcQpuUMp04N2em8z8P//3xJiJ5btHJA2pY30ZbctE4z8RJZeK4bsTLt7ePq7RZuhXV+8PG4sHgj8cfNwj56atb29dhFy94QeQrt/bSXk/Rrdg1Yy8p+TkGfMPtCUvWxsQh4xgKA19vfOJOQVnYIGCptnSAgCgtaCSEXIIzoEzcpXNw0hz5iDoDlykYYQrGLQXPauCHlHX6A57bki5A7XGDS3XVSEoNSO1mb/lYRs0A9oHUGE7B7QD2itdrcnBLf70drtZUfu0Ato7fZ3R3CRQetcZghWMmhd9khQT0XrsneCPkDrsickBK3TLpAQNCQEDQlBQ0LQfjohnJB0oZsg5A/6FwnZbv10cUuXHy1Gbxepj26eLyHpav3Rb+uV4OjqGRLCF8uPobZcISOzI+TPcD4OjKTo7XkR4h8HyN6wbJoXISsw+wFdLRYJaUzsyxkKM9g1untWhNB6+ViQjhyDJKtAvRKr33kS8kEXoo0RkiZ/ypS2emGC/p4TIQszE6W0XGmkXe1/koXwVb0krdDfcyKEB0MzVH9f91TBBv09q2qX3x5Rw1T/h/6eFSH7LGO1HBhDZNaC+vvMCNlbekX7ACnzkO0VKiIzJaS0P+liRV2glKlrWpW46eEXC3T4LAmpzdcUM0P78LGYQUK67ZCxLHH7bjaE/FksFuSYxLNahW4xV50HIWTdNAiJ/lYyn4grVfWsMReZASHCykkDSq+qzkO4d7egdgob4FLz2wk5ft/fUf6i/WJCVh8jDZORX07IWEAwiPxyQki1lStIchUcw8U+U0mqpCRAv/9qQpLDLMuu030+eku7+92XlC4SVRmvcQfv9xNySEOWZmAhZCFrl8oOrSIpMTWTBPdnfj8h6zGtHmRos1kc0Rwz2rp8TJgxUYJN9AzSCYSMSjbJwP0Z3yuKwuMyPBEybw0lLr2R678J9r+YRlg6nhDyCYT0RyBWlEZEFBaVBWLGhNCDC/QIcvhFcp6EVA2F6xP5vR1ISF5YFsSzJSQ0CaluIHGehEg5ZH2VkCPzBJ8ksupZDbxroHmzRaQwCancQ86UEL09db2vWQTpucaffUl8RXXtRJxESOHNNHWND5+e/hhCSIvocdi7qx68S5tHIlx7OMv+NwlchBTRPAkhFiFWUDkrQsbvywx4xrtOPvJyvzhRwMwziCSHz579HEJkW/LJNiTBqlzQKCKVk4p5PrVX5aXMXHa88yVk6GMQ7oNEhsQBbvpkG1mRdj4Wmd4gEzrj5D5VTpIruj6Wj6FdiMSKGPGMCany0tSUQ86ckLqCLeuULlTWZQqrmhCHqijEztVnTwgxl53oRxCizyoh2nmI6eHH+o/pcQ/upi2ETFXMcGcFz5P9XHnZp7jML9XikLX/3UrKSEdiIuPs4ZpgO2v8kMcQ4ieLwbUFP44QZlUuKVARBUu45mwa+Z1T2yIz+Mqx5bZH1iTQ4lA6ReaHE56sqPKOzymyfYmf9PpFacZWq0zMyp3xcgCh6BHMDEJ4biuLQ4b8dYSU55gthx4ac+RuDrOqOaozE+m+PWzyhZIjb7D0Gody74upyppW0HGl1nnCUXOaKYER+9SMML6N213LG7knBNci1CH/+IMkVe2aHjc47BryFxJyEElvjyJk8JMQkemTSL/jBPjMkfbTYQMjhJ6LtLtRM0/ehpG288Ohp8EcpLq42zns6lqZhZjzdUXRAM0zQyFkWlKmv2foICSz0RLar8JvIOSodrHkuEOIKExLfXlrCf3WYPpUVz+lDiUpcOvTqmAEW4TU8HTYLGXc01+Y9k98hy6eOjAw2NQVwjZJFcRKUVgE+17/UL6UENpDyP3Tw2VpN29bdWIROYmQNDLuA1D9EW3OIkt8lJ7LWzQ5D07WHkHhnj1j9ln70tj/OhkCPAFVQAcg1bjZANEdAlzBM2DIUxDSkpNdPz3/q+3y6NMhwmqmYyIYte9coMDLeeFNOEns4Js5FslqmuRNR1XQkL8IPRibuVw7fNbq7tixkeSMNULNIlwsXJuVYfMJc+udHNdMJGakSV8yzr6LkI6wcP+w+fcPEEKPkkO2zn27ACwQIUAg1MKJb4mzrk4KfXmJeNXGtfener0PI3lSrzpem7tlCPBykqi2p8L5gQM1Y55OiEqEo2oILKo/S+6WVEP7mrmuE7D+IU9CiOMueXv8B+2yf0kaQkgREs2XGQjZUXOzhY4CxDFTCUw/9J8PQFGAVgB/z1ojQ+BraaPzsQ+/rjf0UKCCl6jeIJJsC1dtaycmcX3NuCYk7B3yVxMinOXJxcPdP9NuZNvRcuil46LFhLVN4WuLObVVtbB1pohRHPLmXTJLlfKbBDBoiUmh3sKSd6gQiRolWCxY/QGpnOJAvX+LpEpd15QfCw45HNOQNoKQuoDdPN68XZT2dnO5+ecwRchgwYy0EXLwU6B7TGirgb2ikPaZat4jMfMA3yJE1DPA7TJCr08EuBbp3GUhOr1ezaYihKqRh/2SalZnPYkKo82Q/ZYhf71i9iEFkX999iKPIDqNkMPjN56WuoE8LWp+iu0iMGtNQ1TwaValHKoJYBryegZEix6SgWt5HQ0c9brHtdUybaIZlW/FVKCwPpaVmMj3q/mLgEzERrUKjFHd1aw/9xFycaxgpupGyurHIEgtiYBbT95gVAsnDgpIV67DzGLV16acGYpulS7Y20MwI/aL9n1Gvxl+3ixLUcOmmmODECsKJeY1aU1aWr+Itw95KkL2H/XyiwhJXXpUABNV39INAoeExbsI4SaWDtHFU7dhW4NoCq4lTAmCmPGxGj6rN5RCQ8bwGkIGiO5EOSGuB7ot+oY8ASGBrE8e+wi5lnXP4GQpd8VFXnmRgxibWBls5lhIuuqlzFzahGNDVaIjtd2grXbOIJmkkbOazaLEueumrVGJjBCZfB2x3jMw51xdkzT6ModDPr1tYgwhqoK96SNknKRqRBYC7olMmwurKsyKjqJzWxg5SgpiCtBDpACRgUUrFnFb4PdgdBJ6De7Ur4iWAMkixA8AIbak6lvFTaDtFfQPeQJCVnLaBxCy+kRCAs0/XA8SJiGkgOsGzwoam5lDswIx8GKwxUNsKfwwkZExaQQU6yEIMAMIAUlPqJgT/aI7szeD+oc8ASEqMDz1AHK8YObOrSQhun+EPhdGsx4PDUJAz4ByYWC6OQE/uWorLbITq0DRqqJMl0poZ44ldMAImO00cPcxF9b6C4IicbQRJKdUveMJEduLfkKCEyRV5larwbKc6ZPmweU5MuY0hUUjMbNJBqrKTH+b1PHMTqAHoNgljzL9j3lXDOFw6Nr2cmhvvCVmoRTrgKiOA+EYctiatX8RIapA6SPkVZY963GEyGnSl2VfR8DYKhXGXR8bABGzEGagDQMkeJnd8ENAmCMOebTOcCJApouQCP4DGBOMHeCsMAhJQICLrfujZcjTEXLVK5mdKKkaI5P3mQeqRf0Go4WtgjbOlIAE7Ts2GXC8Z+WOBaW5gAGNuAip2zKIVlGFzqTUgDl3RgVwsbqtUK1hTVeaRymLjZVoP+S0ZchTEFILpb2E1PLr6YSo7olIS+q43oVJ9MKFm41ByrNmyAjMcoSBxILpGrq1uRI4hFKtzYNodzMzsojQAYj2SzuKHC4mQqPfI46s/AhsNFtp3PFHyI3qdVeE3HUT8nasYJbaT2ASBYOvEZJrzml8mmwJU68OZANqbrfR5Oa9HDh6UJie9MVmsihMQvYv9wPjtiegc9ROl5zNpHpxUr2e8zT3YEdQnASu5gj9ml1DnoKQpdywveyTVNNTJFXNqU0oTeQnzcAOsMetFk+pDFT/CR23maWeQJWhIaRmr/FutWSF1tX2Ud1MHap/be+yqQOESOg4/4KpdSNnKS+GmiMqpR1DnoIQVcP2ErIY+kA3yBnzw9g4yUOQlasbJvb6XBb4sNEEHOtkCpOGuN3UmJl18oB8Z2Ftv9sdT1VI0UNIXaEL328+WuI1lUh9PyRgd8AIKvoqGkEckmLIkKcjhPdJZkdLqlnblDNtnzzvBYRyqArA40fMMGxIl6qW8TOrKz1xrPuwTzSoJj4TcpCpo5MEjCyt1xWPhkYuan6q2GhX3FOVGsKg0QrtHvIUhFwNE1XVoTSDv5CZumfcSx38RNrUpNTACTgrjB2b/+YvIrdM2ZyTxVW2aBx3w0CsirqOPRGOWOfoY1YRD66bwnCPx+o+grKZcuszz7p0y5AnIESFhpdOQO6OllTdBxAx7nBwwIW27mtElJumcQAjil0v6buDZbkTmuWiEdi1PEO0Dno/UX7r4ga1isO1q8XED60ICHYHmi0XaiuomQpAQXNVe8gnPVU1ihAxSDI7XlLN7dU2bJ7C1AN6eVcAUYSUj6561WOReqLimY/qJI6wS+IWTAO7+hQt27uymZZ1AAIQCRX4zbN+cLzECkcwhnD7RVXOO2DIX04IGUrIkae5l5oT5X6uHlHIkpaHh6rjEUnmfHhZByTi7oo66xNl1BzHzgXPGLZgjFmaJnXJ3KS66b0IXEeoCBBoTyXLXQaZypaJhWxRBgphbq9bQ4Y8DSGr7XUnIQ/HSqpl/VIj4Vo6pfzl5V17DBoggesi5XpNu7axRL28QTHT9dC3S9QJqtjX6jzXMcI+Ycw4Y1JpsLx+4EFlUJG+UEZgQd7aQz71eN5xp0MMElVvBh/EPJygdH+3dp/TrGd+J7bPkIhSGqnDseuiJhx6mrhPyCec75nWWpzqH6v1V7CZnTZnEyvHHD/kryFkv3psuvuYyTd82W5WjCbEmvGSSzH1oa7NTh+TJXf9mXxjNyex7ptPGPI4QtZDJLOLlidrvtSS4vMJ+R5jxmOWiXYaUzDBpxtHCB1GyGLyrwxR+6si+EWEVEDkcRM5kgkOzRxHiFLCHroIuf8GQjKlkIS/iZBDNkqJuad4zoQshoiqPacEfIWRWrYeeUTT2RAS1/+rEzLuabrpCEmHETKhV6kSk/xRByOcESFbJyHbCY53H0dIOkAyu5RdAhMSEtdbo+m4M7zOkhD+kwghwwj5GPO9ZydYVCsGbIIwPDUhWzMP8c+YENWHeN9ByOOxJ2WOt+YoIjrdCflfm1M1j4zphIizz1SHiKo3I7/37OQ8lTePJv4OQlRSFcKHwL3zJ2Q9iJDpBDNWb8qJn1/KaF+CwPRDioLtRF8AMJKQAZLZ07EnZX5SJdOc7/TDv91XnREr1OauUkh4MEWl9imE8C5CppdUay7IhF/D8tV5dxDUT0zIj6VO3YnPmhD1xPZrFyFX30IId55r9gPNPp/XKz7jsOVpCBkgqh59UuYnEZKqlokf/w2bodlSxsZ3jk1GiEoxXs5JUs1Ab+nP/0qa1Oz21/swg+15E6IK2fsOOaTqUl1O51FRuA/W/+GZiLZikgm/YPZTCOk6y+xiekkVPLvCttvfg0idUqkGw/Dr+R9JSCWXfvjb601rk2r62T2Ix4TlX/INvSSiRag3a/OEhh5NJkjuxn6L2VJN/7UrimxetqqJREzq0PA3RZDvtbGE3DZfofv35ubxUrOHm6frrXqoZsmn/Vxp2YWc+zjB306IkN+IqWnq4OFLXtXDky4yaOdEyFZ9j+r6yvE9UIn65uapQwja+RDyR/9uXaqb/geCnp4tIfU602UCHT1jQrZk2cPHEiPIvAnZZ6NdjCwXmIPMnZCyuFwFbj5uBfKBhEjzCREL3YyH2NHmTggaEoKGhKChISFoSAgaEoI2mb2Rv+gEtA57J0/oBLQOeyQP6AS0Drsjd+gEtHb7uyO7e3QDWqu97AnBZQatY5HZE7JBN6C12cVuT8gOqxm0NvvvQMjdNXoCrS2ElITs3tEVaE57loTsUFdFc9n7ThHyjOsMmm1/dzUhu0d0B5pp9xuNkN0rOgQN2vXzTicEEUFzA1ITsnvEXARNy0HudiYhu2esaNCUvWx2NiG73TuGEbRDjvqfRoVOyO4OBXi07f2rzgQkZLfbPGAzwLztDfJhEVIGkocnzEjmWb5cvDxuLB7+F2AAw+WtzrAzIicAAAAASUVORK5CYII=";
const BrevoLogo = (props) => {
  return /* @__PURE__ */ jsx(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "1000",
      height: "295",
      viewBox: "0 0 1000 295",
      fill: "none",
      ...props,
      children: /* @__PURE__ */ jsx(
        "path",
        {
          d: "M820.28 182.338C820.28 137.755 848.604 106.4 888.892 106.4C929.18 106.4 957.956 137.737 957.956 182.338C957.956 226.939 929.187 256.5 888.892 256.5C848.598 256.5 820.28 225.588 820.28 182.338ZM778.224 182.338C778.224 248.12 824.262 294.479 888.886 294.479C953.51 294.479 1000 248.12 1000 182.338C1000 116.556 953.962 68.4399 888.886 68.4399C823.81 68.4399 778.224 115.686 778.224 182.338ZM563.521 71.0853L650.292 291.821H691.025L777.791 71.0853H733.966L671.104 241.498H670.214L607.352 71.0853H563.521ZM394.856 174.383C397.508 133.76 424.515 106.4 461.261 106.4C493.128 106.4 517.037 126.712 520.58 157.179H447.089C420.973 157.179 406.801 160.269 396.191 174.402H394.856V174.39V174.383ZM352.805 181.006C352.805 246.788 399.289 294.46 463.468 294.46C506.854 294.46 544.916 272.391 561.295 237.502L525.885 219.835C513.494 242.792 489.585 256.482 463.468 256.482C432.028 256.482 403.704 232.637 403.704 209.679C403.704 197.766 411.673 192.457 423.18 192.457H563.502V180.544C563.502 114.317 521.007 68.4029 459.925 68.4029C398.844 68.4029 352.799 115.649 352.799 180.988M232.399 291.796H272.242V156.285C272.242 127.149 290.382 106.394 315.627 106.394C326.256 106.394 337.311 109.927 342.635 114.774C346.623 104.174 352.818 93.5923 362.111 82.9924C351.482 74.1684 333.342 68.4153 315.627 68.4153C266.937 68.4153 232.399 104.618 232.399 156.267V291.809V291.796ZM39.843 145.698V37.9598H105.358C127.486 37.9598 142.103 50.7611 142.103 70.185C142.103 92.2542 123.072 109.033 84.1191 121.834C57.5571 130.214 45.6116 137.281 41.1785 145.679L39.843 145.692V145.698ZM39.843 253.861V208.835C39.843 188.967 56.6668 169.543 80.1311 162.032C100.943 154.966 118.193 147.899 132.81 140.407C152.286 151.895 164.232 171.744 164.232 192.5C164.232 227.814 130.584 253.861 84.9909 253.861H39.843ZM0 291.821H88.5337C155.829 291.821 206.282 249.884 206.282 194.257C206.282 163.79 190.794 136.43 163.341 118.763C177.513 104.63 184.153 88.2955 184.153 68.4276C184.153 27.3784 154.493 0 109.791 0H0V291.821Z",
          fill: "currentColor"
        }
      )
    }
  );
};
function makeId(uid, event) {
  return `${uid}::${event}`;
}
function formatContentTypeUid(uid) {
  return uid.replace(/^api::/, "");
}
const EVENTS = [
  { value: "create", labelKey: "create" },
  { value: "update", labelKey: "update" },
  { value: "delete", labelKey: "delete" },
  { value: "publish", labelKey: "publish" },
  { value: "unpublish", labelKey: "unpublish" }
];
const DEFAULT_SEND_EMAIL_ATTRIBUTES = [
  { name: "firstname", type: "string", kind: "scalar" },
  { name: "lastname", type: "string", kind: "scalar" },
  { name: "email", type: "string", kind: "scalar" },
  { name: "message", type: "string", kind: "scalar" }
];
function ActiveTemplatesCard({
  selectedContentTypes,
  hasTrigger,
  onManageContentTypes,
  onEditTemplate
}) {
  const intl = useIntl();
  return /* @__PURE__ */ jsxs(
    Box,
    {
      padding: 8,
      background: "neutral0",
      borderColor: "neutral200",
      borderWidth: "1px",
      borderStyle: "solid",
      borderRadius: "8px",
      shadow: "tableShadow",
      height: "100%",
      children: [
        /* @__PURE__ */ jsxs(
          Flex,
          {
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
            gap: 3,
            children: [
              /* @__PURE__ */ jsx(Typography, { variant: "delta", as: "h2", style: { marginBottom: 15 }, children: intl.formatMessage({
                id: "brevo-template-sender.config.activeTemplates",
                defaultMessage: "Active Content-Type templates"
              }) }),
              /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "S", onClick: onManageContentTypes, children: intl.formatMessage({
                id: "brevo-template-sender.config.manageContentTypes",
                defaultMessage: "Manage content types"
              }) })
            ]
          }
        ),
        selectedContentTypes.length === 0 ? /* @__PURE__ */ jsx(Typography, { variant: "pi", textColor: "neutral600", children: intl.formatMessage({
          id: "brevo-template-sender.config.noActiveTemplates",
          defaultMessage: "No content type selected. Click « Manage content types » to enable events and edit templates."
        }) }) : /* @__PURE__ */ jsx(Flex, { direction: "column", gap: 3, style: { width: "100%" }, children: selectedContentTypes.map((ct) => /* @__PURE__ */ jsx(
          Box,
          {
            padding: 3,
            background: "neutral100",
            borderColor: "neutral200",
            borderWidth: "1px",
            borderStyle: "solid",
            borderRadius: "4px",
            style: { width: "100%", minWidth: 0 },
            children: /* @__PURE__ */ jsxs(
              Flex,
              {
                justifyContent: "space-between",
                alignItems: "center",
                wrap: "wrap",
                style: { width: "100%", gap: 4 },
                children: [
                  /* @__PURE__ */ jsxs(Box, { children: [
                    /* @__PURE__ */ jsx(Typography, { fontWeight: "semiBold", children: ct.displayName }),
                    /* @__PURE__ */ jsx(
                      Typography,
                      {
                        variant: "pi",
                        textColor: "neutral600",
                        marginLeft: 2,
                        children: formatContentTypeUid(ct.uid)
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs(Flex, { gap: 2, alignItems: "center", wrap: "wrap", children: [
                    /* @__PURE__ */ jsx(Flex, { gap: 1, wrap: "wrap", children: EVENTS.filter((e) => hasTrigger(ct.uid, e.value)).map(
                      (e) => /* @__PURE__ */ jsx(
                        Box,
                        {
                          paddingLeft: 2,
                          paddingRight: 2,
                          paddingTop: 1,
                          paddingBottom: 1,
                          background: "primary100",
                          borderRadius: "4px",
                          children: /* @__PURE__ */ jsx(
                            Typography,
                            {
                              variant: "pi",
                              textColor: "primary700",
                              fontWeight: "bold",
                              children: intl.formatMessage({
                                id: `brevo-template-sender.event.${e.labelKey}`,
                                defaultMessage: e.value
                              })
                            }
                          )
                        },
                        e.value
                      )
                    ) }),
                    /* @__PURE__ */ jsx(
                      Button,
                      {
                        variant: "tertiary",
                        size: "S",
                        onClick: () => onEditTemplate(ct),
                        children: intl.formatMessage({
                          id: "brevo-template-sender.config.editTemplate",
                          defaultMessage: "Edit Template"
                        })
                      }
                    )
                  ] })
                ]
              }
            )
          },
          ct.uid
        )) })
      ]
    }
  );
}
function ConfigCard({
  settings,
  setSettings,
  saving,
  onSave,
  message,
  onDismissMessage
}) {
  const intl = useIntl();
  return /* @__PURE__ */ jsxs(
    Box,
    {
      padding: 8,
      background: "neutral0",
      borderColor: "neutral200",
      borderWidth: "1px",
      borderStyle: "solid",
      borderRadius: "8px",
      shadow: "tableShadow",
      height: "100%",
      children: [
        /* @__PURE__ */ jsx(Typography, { variant: "delta", as: "h2", style: { marginBottom: 15 }, children: intl.formatMessage({
          id: "brevo-template-sender.config.configTitle",
          defaultMessage: "Config"
        }) }),
        /* @__PURE__ */ jsx(Typography, { variant: "epsilon", textColor: "neutral600", children: intl.formatMessage({
          id: "brevo-template-sender.settings.description",
          defaultMessage: "Enter the information required to send emails via Brevo. The API key is in your Brevo account (Settings → API Keys)."
        }) }),
        message && /* @__PURE__ */ jsx(
          Alert,
          {
            marginBottom: 4,
            variant: message.type === "error" ? "danger" : "success",
            onClose: onDismissMessage,
            closeLabel: intl.formatMessage({
              id: "app.components.Button.close",
              defaultMessage: "Close"
            }),
            children: message.text
          }
        ),
        /* @__PURE__ */ jsxs(
          Flex,
          {
            direction: "column",
            gap: 4,
            marginBottom: 6,
            alignItems: "flex-start",
            marginTop: 4,
            children: [
              /* @__PURE__ */ jsxs(Field.Root, { id: "brevo-settings-apiKey", style: { width: "100%" }, children: [
                /* @__PURE__ */ jsx(Field.Label, { children: intl.formatMessage({
                  id: "brevo-template-sender.settings.apiKey",
                  defaultMessage: "Brevo API key"
                }) }),
                /* @__PURE__ */ jsxs(
                  Flex,
                  {
                    direction: "row",
                    gap: 4,
                    alignItems: "flex-start",
                    wrap: "wrap",
                    marginTop: 2,
                    children: [
                      /* @__PURE__ */ jsxs(
                        Box,
                        {
                          style: { minWidth: 200, maxWidth: 400, flex: "1 1 200px" },
                          children: [
                            /* @__PURE__ */ jsx(
                              TextInput,
                              {
                                id: "brevo-settings-apiKey",
                                type: "password",
                                value: settings.apiKey,
                                onChange: (e) => setSettings((s) => ({ ...s, apiKey: e.target.value })),
                                placeholder: settings.apiKeySet ? intl.formatMessage({
                                  id: "brevo-template-sender.settings.apiKeyPlaceholder",
                                  defaultMessage: "Leave empty to keep current key"
                                }) : intl.formatMessage({
                                  id: "brevo-template-sender.settings.apiKeyPlaceholderNew",
                                  defaultMessage: "xkeysib-..."
                                }),
                                size: "M"
                              }
                            ),
                            settings.apiKey && !settings.apiKey.startsWith("xkeysib-") && /* @__PURE__ */ jsx(Box, { paddingTop: 1, children: /* @__PURE__ */ jsx(Typography, { variant: "pi", textColor: "warning600", fontWeight: "bold", children: intl.formatMessage({
                              id: "brevo-template-sender.settings.apiKeyInvalidFormat",
                              defaultMessage: "⚠ This doesn't look like a Brevo API key (should start with xkeysib-). Make sure you're not using an SMTP key."
                            }) }) }),
                            settings.apiKeySet && !settings.apiKey && /* @__PURE__ */ jsx(Box, { paddingTop: 1, children: /* @__PURE__ */ jsx(
                              Typography,
                              {
                                variant: "pi",
                                textColor: "success600",
                                fontWeight: "bold",
                                children: intl.formatMessage({
                                  id: "brevo-template-sender.settings.apiKeySet",
                                  defaultMessage: "An API key is already configured."
                                })
                              }
                            ) })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsx(Box, { style: { flex: "1 1 240px", minWidth: 0 }, children: /* @__PURE__ */ jsxs(Typography, { variant: "pi", textColor: "neutral600", children: [
                        intl.formatMessage({
                          id: "brevo-template-sender.settings.apiKeyHint",
                          defaultMessage: "To find or generate an API key, go to your Brevo account: Settings → SMTP & API → API keys."
                        }),
                        " ",
                        /* @__PURE__ */ jsx(
                          "a",
                          {
                            href: "https://help.brevo.com/hc/articles/209467485",
                            target: "_blank",
                            rel: "noopener noreferrer",
                            style: {
                              color: "var(--strapi-colors-primary600)",
                              textDecoration: "underline"
                            },
                            children: intl.formatMessage({
                              id: "brevo-template-sender.settings.apiKeyHintLink",
                              defaultMessage: "Documentation"
                            })
                          }
                        )
                      ] }) })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs(Field.Root, { id: "brevo-settings-senderEmail", style: { width: "100%" }, children: [
                /* @__PURE__ */ jsx(Field.Label, { children: intl.formatMessage({
                  id: "brevo-template-sender.settings.senderEmail",
                  defaultMessage: "Sender email"
                }) }),
                /* @__PURE__ */ jsxs(
                  Flex,
                  {
                    direction: "row",
                    gap: 4,
                    alignItems: "flex-start",
                    wrap: "wrap",
                    marginTop: 2,
                    children: [
                      /* @__PURE__ */ jsx(
                        Box,
                        {
                          style: { minWidth: 200, maxWidth: 400, flex: "1 1 200px" },
                          children: /* @__PURE__ */ jsx(
                            TextInput,
                            {
                              id: "brevo-settings-senderEmail",
                              type: "email",
                              value: settings.senderEmail,
                              onChange: (e) => setSettings((s) => ({
                                ...s,
                                senderEmail: e.target.value
                              })),
                              placeholder: "no-reply@yourdomain.com",
                              size: "M"
                            }
                          )
                        }
                      ),
                      /* @__PURE__ */ jsx(Box, { style: { flex: "1 1 240px", minWidth: 0 }, children: /* @__PURE__ */ jsxs(Typography, { variant: "pi", textColor: "neutral600", children: [
                        intl.formatMessage({
                          id: "brevo-template-sender.settings.senderEmailHint",
                          defaultMessage: "Remember to authenticate your sender domain in Brevo for better deliverability (SPF, DKIM)."
                        }),
                        " ",
                        /* @__PURE__ */ jsx(
                          "a",
                          {
                            href: "https://help.brevo.com/hc/articles/14925263522578",
                            target: "_blank",
                            rel: "noopener noreferrer",
                            style: {
                              color: "var(--strapi-colors-primary600)",
                              textDecoration: "underline"
                            },
                            children: intl.formatMessage({
                              id: "brevo-template-sender.settings.senderEmailHintLink",
                              defaultMessage: "Documentation"
                            })
                          }
                        )
                      ] }) })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs(
                Field.Root,
                {
                  id: "brevo-settings-senderName",
                  style: { width: "100%", maxWidth: "400px" },
                  children: [
                    /* @__PURE__ */ jsx(Field.Label, { children: intl.formatMessage({
                      id: "brevo-template-sender.settings.senderName",
                      defaultMessage: "Sender name (optional)"
                    }) }),
                    /* @__PURE__ */ jsx(
                      TextInput,
                      {
                        id: "brevo-settings-senderName",
                        value: settings.senderName,
                        onChange: (e) => setSettings((s) => ({ ...s, senderName: e.target.value })),
                        placeholder: "John Doe",
                        size: "M"
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                Field.Root,
                {
                  id: "brevo-settings-openaiApiKey",
                  style: { width: "100%" },
                  children: [
                    /* @__PURE__ */ jsx(Field.Label, { children: intl.formatMessage({
                      id: "brevo-template-sender.settings.openaiApiKey",
                      defaultMessage: "OpenAI API key (optional)"
                    }) }),
                    /* @__PURE__ */ jsxs(
                      Flex,
                      {
                        direction: "row",
                        gap: 4,
                        alignItems: "flex-start",
                        wrap: "wrap",
                        marginTop: 2,
                        children: [
                          /* @__PURE__ */ jsxs(
                            Box,
                            {
                              style: { minWidth: 200, maxWidth: 400, flex: "1 1 200px" },
                              children: [
                                /* @__PURE__ */ jsx(
                                  TextInput,
                                  {
                                    id: "brevo-settings-openaiApiKey",
                                    type: "password",
                                    value: settings.openaiApiKey,
                                    onChange: (e) => setSettings((s) => ({
                                      ...s,
                                      openaiApiKey: e.target.value
                                    })),
                                    placeholder: settings.openaiApiKeySet ? intl.formatMessage({
                                      id: "brevo-template-sender.settings.apiKeyPlaceholder",
                                      defaultMessage: "Leave empty to keep current key"
                                    }) : "sk-...",
                                    size: "M"
                                  }
                                ),
                                settings.openaiApiKeySet && /* @__PURE__ */ jsx(Box, { paddingTop: 1, children: /* @__PURE__ */ jsx(
                                  Typography,
                                  {
                                    variant: "pi",
                                    textColor: "success600",
                                    fontWeight: "bold",
                                    children: intl.formatMessage({
                                      id: "brevo-template-sender.settings.openaiApiKeySet",
                                      defaultMessage: "An OpenAI key is configured."
                                    })
                                  }
                                ) })
                              ]
                            }
                          ),
                          /* @__PURE__ */ jsx(Box, { style: { flex: "1 1 240px", minWidth: 0 }, children: /* @__PURE__ */ jsx(Typography, { variant: "pi", textColor: "neutral600", children: intl.formatMessage({
                            id: "brevo-template-sender.settings.openaiApiKeyHint",
                            defaultMessage: "Enables « Generate with AI » in the template editor. Create a key at platform.openai.com."
                          }) }) })
                        ]
                      }
                    )
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx(Button, { onClick: onSave, loading: saving, size: "L", children: intl.formatMessage({
          id: "brevo-template-sender.settings.save",
          defaultMessage: "Save settings"
        }) })
      ]
    }
  );
}
function ManageContentTypesModal({
  open,
  onOpenChange,
  contentTypes,
  hasTrigger,
  toggleTrigger,
  getTemplateForContentType,
  onEditTemplate
}) {
  const intl = useIntl();
  return /* @__PURE__ */ jsx(Modal.Root, { open, onOpenChange, children: /* @__PURE__ */ jsxs(
    Modal.Content,
    {
      labelledBy: "manage-content-types-title",
      style: { maxWidth: "90vw", width: 960 },
      children: [
        /* @__PURE__ */ jsx(Modal.Header, { children: /* @__PURE__ */ jsx(
          Typography,
          {
            id: "manage-content-types-title",
            variant: "beta",
            as: "h2",
            style: { marginBottom: 15 },
            children: intl.formatMessage({
              id: "brevo-template-sender.config.manageContentTypesTitle",
              defaultMessage: "Manage content types & events"
            })
          }
        ) }),
        /* @__PURE__ */ jsx(Modal.Body, { children: /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(Thead, { children: /* @__PURE__ */ jsxs(Tr, { children: [
            /* @__PURE__ */ jsx(Th, { children: intl.formatMessage({
              id: "brevo-template-sender.config.contentType",
              defaultMessage: "Content Type"
            }) }),
            EVENTS.map((e) => /* @__PURE__ */ jsx(Th, { children: intl.formatMessage({
              id: `brevo-template-sender.event.${e.labelKey}`,
              defaultMessage: e.value
            }) }, e.value)),
            /* @__PURE__ */ jsx(Th, { children: intl.formatMessage({
              id: "brevo-template-sender.config.editTemplate",
              defaultMessage: "Edit Template"
            }) })
          ] }) }),
          /* @__PURE__ */ jsx(Tbody, { children: contentTypes.map((ct) => /* @__PURE__ */ jsxs(Tr, { children: [
            /* @__PURE__ */ jsxs(Td, { children: [
              /* @__PURE__ */ jsx(Box, { paddingTop: 1, paddingBottom: 1, children: /* @__PURE__ */ jsx(Typography, { fontWeight: "semiBold", children: ct.displayName }) }),
              /* @__PURE__ */ jsx(Box, { paddingTop: 2, children: /* @__PURE__ */ jsx(Typography, { variant: "pi", textColor: "neutral600", children: formatContentTypeUid(ct.uid) }) })
            ] }),
            EVENTS.map((e) => /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx(
              Checkbox,
              {
                checked: hasTrigger(ct.uid, e.value),
                onCheckedChange: (checked) => toggleTrigger(ct.uid, e.value, checked === true)
              }
            ) }, e.value)),
            /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx(
              Button,
              {
                variant: "tertiary",
                size: "S",
                disabled: !getTemplateForContentType(ct.uid),
                onClick: () => onEditTemplate(ct),
                children: intl.formatMessage({
                  id: "brevo-template-sender.config.editTemplate",
                  defaultMessage: "Edit Template"
                })
              }
            ) })
          ] }, ct.uid)) })
        ] }) }),
        /* @__PURE__ */ jsxs(Modal.Footer, { children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "tertiary",
              onClick: () => onOpenChange(false),
              children: intl.formatMessage({
                id: "app.components.Button.cancel",
                defaultMessage: "Cancel"
              })
            }
          ),
          /* @__PURE__ */ jsx(Button, { onClick: () => onOpenChange(false), children: intl.formatMessage({
            id: "brevo-template-sender.config.closeManage",
            defaultMessage: "Close"
          }) })
        ] })
      ]
    }
  ) });
}
function SendEmailApiCard({
  onConfigureTemplate
}) {
  const intl = useIntl();
  const [docModalOpen, setDocModalOpen] = useState(false);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      Box,
      {
        padding: 8,
        background: "neutral0",
        borderColor: "neutral200",
        borderWidth: "1px",
        borderStyle: "solid",
        borderRadius: "8px",
        shadow: "tableShadow",
        height: "100%",
        children: [
          /* @__PURE__ */ jsxs(
            Flex,
            {
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 4,
              gap: 3,
              wrap: "wrap",
              children: [
                /* @__PURE__ */ jsx(Typography, { variant: "delta", as: "h2", style: { marginBottom: 0 }, children: intl.formatMessage({
                  id: "brevo-template-sender.config.sendEmailApi",
                  defaultMessage: "Send Email API"
                }) }),
                /* @__PURE__ */ jsxs(Flex, { gap: 2, alignItems: "center", wrap: "wrap", children: [
                  /* @__PURE__ */ jsx(
                    Typography,
                    {
                      variant: "pi",
                      textColor: "neutral700",
                      style: { fontFamily: "monospace", fontSize: 12 },
                      children: "POST /api/brevo-template-sender/send"
                    }
                  ),
                  /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "S", onClick: onConfigureTemplate, children: intl.formatMessage({
                    id: "brevo-template-sender.sendEmail.configureTemplate",
                    defaultMessage: "Configure template"
                  }) }),
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      variant: "tertiary",
                      size: "S",
                      onClick: () => setDocModalOpen(true),
                      children: intl.formatMessage({
                        id: "brevo-template-sender.sendEmail.documentation",
                        defaultMessage: "Documentation"
                      })
                    }
                  )
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsx(Typography, { variant: "epsilon", textColor: "neutral600", children: intl.formatMessage({
            id: "brevo-template-sender.sendEmail.description",
            defaultMessage: "API that can be called at any time to send an email with the default template. Recipients are configured in the template (above). Dynamic values (params) are set by the caller."
          }) })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      Modal.Root,
      {
        open: docModalOpen,
        onOpenChange: (open) => setDocModalOpen(open),
        children: /* @__PURE__ */ jsxs(
          Modal.Content,
          {
            labelledBy: "send-email-api-doc-title",
            style: { maxWidth: 560 },
            children: [
              /* @__PURE__ */ jsx(Modal.Header, { children: /* @__PURE__ */ jsx(Typography, { id: "send-email-api-doc-title", variant: "beta", as: "h2", children: intl.formatMessage({
                id: "brevo-template-sender.sendEmail.docModalTitle",
                defaultMessage: "Send Email API — Documentation"
              }) }) }),
              /* @__PURE__ */ jsx(Modal.Body, { children: /* @__PURE__ */ jsxs(
                Flex,
                {
                  direction: "column",
                  gap: 6,
                  alignItems: "flex-start",
                  style: { width: "100%" },
                  children: [
                    /* @__PURE__ */ jsx(
                      Typography,
                      {
                        variant: "pi",
                        textColor: "neutral700",
                        lineHeight: 1.6,
                        style: { textAlign: "left", width: "100%" },
                        children: intl.formatMessage({
                          id: "brevo-template-sender.sendEmail.docModalIntro",
                          defaultMessage: "Call this endpoint to send an email using the default template (configured above)."
                        })
                      }
                    ),
                    /* @__PURE__ */ jsxs(Box, { paddingTop: 2, paddingBottom: 2, style: { width: "100%" }, children: [
                      /* @__PURE__ */ jsx(
                        Typography,
                        {
                          variant: "epsilon",
                          fontWeight: "bold",
                          textColor: "neutral800",
                          marginBottom: 2,
                          children: intl.formatMessage({
                            id: "brevo-template-sender.sendEmail.docModalEndpoint",
                            defaultMessage: "Endpoint"
                          })
                        }
                      ),
                      /* @__PURE__ */ jsxs(
                        Flex,
                        {
                          gap: 2,
                          alignItems: "center",
                          wrap: "wrap",
                          justifyContent: "flex-start",
                          children: [
                            /* @__PURE__ */ jsx(
                              Box,
                              {
                                paddingLeft: 2,
                                paddingRight: 2,
                                paddingTop: 1,
                                paddingBottom: 1,
                                background: "primary100",
                                borderRadius: "4px",
                                children: /* @__PURE__ */ jsx(
                                  Typography,
                                  {
                                    variant: "pi",
                                    fontWeight: "bold",
                                    textColor: "primary700",
                                    style: { fontSize: 11 },
                                    children: "POST"
                                  }
                                )
                              }
                            ),
                            /* @__PURE__ */ jsx(
                              Typography,
                              {
                                variant: "pi",
                                textColor: "neutral800",
                                style: {
                                  fontFamily: "monospace",
                                  fontSize: 13,
                                  wordBreak: "break-all"
                                },
                                children: "/api/brevo-template-sender/send"
                              }
                            )
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs(Box, { paddingTop: 2, paddingBottom: 2, style: { width: "100%" }, children: [
                      /* @__PURE__ */ jsx(
                        Typography,
                        {
                          variant: "epsilon",
                          fontWeight: "bold",
                          textColor: "neutral800",
                          marginBottom: 2,
                          children: intl.formatMessage({
                            id: "brevo-template-sender.sendEmail.docModalBody",
                            defaultMessage: "Request body (JSON)"
                          })
                        }
                      ),
                      /* @__PURE__ */ jsxs(Flex, { direction: "column", gap: 2, alignItems: "flex-start", children: [
                        /* @__PURE__ */ jsxs(Box, { children: [
                          /* @__PURE__ */ jsx(
                            Typography,
                            {
                              variant: "pi",
                              fontWeight: "semiBold",
                              textColor: "neutral800",
                              style: { fontFamily: "monospace", fontSize: 12 },
                              children: "to "
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            Typography,
                            {
                              variant: "pi",
                              textColor: "neutral500",
                              style: { fontSize: 11 },
                              children: intl.formatMessage({
                                id: "brevo-template-sender.sendEmail.docModalBodyToOptional",
                                defaultMessage: "(optional)"
                              })
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            Typography,
                            {
                              variant: "pi",
                              textColor: "neutral600",
                              lineHeight: 1.5,
                              marginLeft: 2,
                              children: intl.formatMessage({
                                id: "brevo-template-sender.sendEmail.docModalBodyTo",
                                defaultMessage: " — Override recipient email. If omitted, recipients configured in the template are used."
                              })
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxs(Box, { children: [
                          /* @__PURE__ */ jsx(
                            Typography,
                            {
                              variant: "pi",
                              fontWeight: "semiBold",
                              textColor: "neutral800",
                              style: { fontFamily: "monospace", fontSize: 12 },
                              children: "params"
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            Typography,
                            {
                              variant: "pi",
                              textColor: "neutral600",
                              lineHeight: 1.5,
                              marginLeft: 2,
                              children: intl.formatMessage({
                                id: "brevo-template-sender.sendEmail.docModalBodyParams",
                                defaultMessage: "Object with dynamic values for the template placeholders (e.g. {{firstname}}, {{message}}). Keys must match the placeholders used in the template."
                              })
                            }
                          )
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs(
                      Box,
                      {
                        paddingTop: 2,
                        paddingBottom: 2,
                        style: { width: "100%", minWidth: 0 },
                        children: [
                          /* @__PURE__ */ jsx(
                            Typography,
                            {
                              variant: "epsilon",
                              fontWeight: "bold",
                              textColor: "neutral800",
                              marginBottom: 2,
                              children: intl.formatMessage({
                                id: "brevo-template-sender.sendEmail.docModalExample",
                                defaultMessage: "Example"
                              })
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            Box,
                            {
                              padding: 4,
                              background: "neutral100",
                              borderRadius: "4px",
                              borderWidth: "1px",
                              borderColor: "neutral200",
                              borderStyle: "solid",
                              style: {
                                width: "100%",
                                minWidth: 0,
                                boxSizing: "border-box"
                              },
                              children: /* @__PURE__ */ jsx(
                                Typography,
                                {
                                  variant: "pi",
                                  textColor: "neutral800",
                                  as: "pre",
                                  style: {
                                    fontFamily: "monospace",
                                    fontSize: 12,
                                    lineHeight: 1.6,
                                    whiteSpace: "pre-wrap",
                                    margin: 0,
                                    textAlign: "left",
                                    width: "100%"
                                  },
                                  children: `// Recipients configured in the template (admin)
{
  "params": {
    "firstname": "John",
    "message": "Hello!"
  }
}

// Override recipient (optional)
{
  "to": "user@example.com",
  "params": {
    "firstname": "John",
    "message": "Hello!"
  }
}`
                                }
                              )
                            }
                          )
                        ]
                      }
                    )
                  ]
                }
              ) }),
              /* @__PURE__ */ jsx(Modal.Footer, { children: /* @__PURE__ */ jsx(Button, { onClick: () => setDocModalOpen(false), children: intl.formatMessage({
                id: "app.components.Button.close",
                defaultMessage: "Close"
              }) }) })
            ]
          }
        )
      }
    )
  ] });
}
const STAR_COLOR_GRAY = "#6b7280";
const STAR_COLOR_GOLD = "#ca8a04";
function getRepoPath(url) {
  return url.replace(/^https?:\/\/github\.com\/?/i, "").replace(/\/$/, "");
}
function SupportPluginCard({
  supportRepoUrl,
  bmcButtonImg: bmcButtonImg2
}) {
  const intl = useIntl();
  const [starHighlight, setStarHighlight] = useState(false);
  const repoPath = getRepoPath(supportRepoUrl);
  const repoUrl = repoPath ? `https://github.com/${repoPath}` : supportRepoUrl;
  const starColor = starHighlight ? STAR_COLOR_GOLD : STAR_COLOR_GRAY;
  return /* @__PURE__ */ jsxs(
    Box,
    {
      padding: 8,
      background: "neutral0",
      borderColor: "neutral200",
      borderWidth: "1px",
      borderStyle: "solid",
      borderRadius: "8px",
      shadow: "tableShadow",
      height: "100%",
      position: "relative",
      children: [
        /* @__PURE__ */ jsx(Typography, { variant: "delta", as: "h2", style: { marginBottom: 15 }, children: intl.formatMessage({
          id: "brevo-template-sender.promo.title",
          defaultMessage: "Support the plugin"
        }) }),
        /* @__PURE__ */ jsx(
          Box,
          {
            padding: 3,
            marginBottom: 4,
            background: "primary100",
            borderColor: "primary200",
            borderWidth: "1px",
            borderStyle: "solid",
            borderRadius: "4px",
            style: { width: "100%" },
            children: /* @__PURE__ */ jsx(Typography, { variant: "pi", textColor: "primary700", children: intl.formatMessage({
              id: "brevo-template-sender.promo.badge",
              defaultMessage: "This block is hidden in run start so your end users won't see this block. As a developer, you can support the plugin."
            }) })
          }
        ),
        /* @__PURE__ */ jsx(Typography, { variant: "pi", textColor: "neutral600", children: intl.formatMessage({
          id: "brevo-template-sender.promo.description",
          defaultMessage: "Find this plugin helpful? Support me by buying a coffee and/or leave a star to the repo on GitHub."
        }) }),
        /* @__PURE__ */ jsxs(Flex, { gap: 3, wrap: "wrap", alignItems: "center", style: { marginTop: 15 }, children: [
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://www.buymeacoffee.com/dupflo",
              target: "_blank",
              rel: "noopener noreferrer",
              children: /* @__PURE__ */ jsx(
                "img",
                {
                  src: bmcButtonImg2,
                  alt: "Buy Me A Coffee",
                  style: { height: 60, width: 217 }
                }
              )
            }
          ),
          /* @__PURE__ */ jsxs(
            Flex,
            {
              as: "a",
              href: repoUrl,
              target: "_blank",
              rel: "noopener noreferrer",
              gap: 2,
              paddingTop: 2,
              paddingBottom: 2,
              paddingLeft: 3,
              paddingRight: 3,
              background: "neutral100",
              borderColor: "neutral200",
              borderWidth: "1px",
              borderStyle: "solid",
              borderRadius: "4px",
              alignItems: "center",
              style: { textDecoration: "none", cursor: "pointer" },
              onMouseEnter: () => setStarHighlight(true),
              onMouseLeave: () => setStarHighlight(false),
              onMouseDown: () => setStarHighlight(true),
              onMouseUp: () => setStarHighlight(false),
              children: [
                /* @__PURE__ */ jsx(Box, { style: { color: starColor, display: "flex" }, children: /* @__PURE__ */ jsx(Star, { "aria-hidden": true, style: { width: 16, height: 16, flexShrink: 0 } }) }),
                /* @__PURE__ */ jsx(Typography, { variant: "pi", textColor: "neutral700", fontWeight: "semiBold", children: intl.formatMessage({
                  id: "brevo-template-sender.promo.starGitHub",
                  defaultMessage: "Star on GitHub"
                }) })
              ]
            }
          )
        ] })
      ]
    }
  );
}
const SAMPLE = {
  logo_url: "",
  email: "email@example.com",
  subject: "Subject",
  message: "Message...",
  firstname: "John",
  lastname: "Doe",
  mailto: "contact@example.com"
};
function getDefaultEmailTemplateHtml(greeting, body) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;font-family:sans-serif;">
  <tr>
    <td style="padding:24px;background:#fff;border-bottom:1px solid #eee;">
      <img src="{{logo_url}}" alt="Logo" style="max-height:80px;display:block;" />
    </td>
  </tr>
  <tr>
    <td style="padding:24px;background:#fff;">
      <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">${greeting}</p>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">${body}</p>
    </td>
  </tr>
</table>`;
}
const ModalContentLarge = styled(Modal.Content)`
  width: 100%;
  max-width: 720px;
  height: 95vh;
  max-height: 95vh;
`;
const ModalContentHtmlEditor = styled(Modal.Content)`
  width: 90vw;
  max-width: 1400px;
  height: 85vh;
  max-height: 85vh;
`;
const PreviewOnlyLayout = styled(Box)`
  display: flex;
  flex-direction: column;
  min-height: 400px;
  height: calc(95vh - 320px);
`;
const GridLayoutHtmlEditor = styled(Box)`
  display: grid;
  grid-template-columns: 1fr;
  min-height: 480px;
  height: calc(85vh - 180px);
`;
const Column = styled(Box)`
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-radius: 6px;
  border: 1px solid var(--strapi-colors-neutral200);
  background: var(--strapi-colors-neutral50);
`;
const ColumnLabel = styled.div`
  padding: 10px 14px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--strapi-colors-neutral600);
  background: var(--strapi-colors-neutral100);
  border-bottom: 1px solid var(--strapi-colors-neutral200);
  border-radius: 6px 6px 0 0;
`;
const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--strapi-colors-neutral600);
  background: var(--strapi-colors-neutral100);
  border-bottom: 1px solid var(--strapi-colors-neutral200);
  border-radius: 6px 6px 0 0;
`;
const PreviewBody = styled.div`
  flex: 1;
  min-height: 0;
  padding: 8px;
  display: flex;
  flex-direction: column;
`;
styled.div`
  padding: 10px;
  overflow-y: auto;
  flex: 1;
`;
styled.div`
  padding: 10px 14px;
  margin-bottom: 8px;
  font-family: monospace;
  font-size: 13px;
  background: ${(p) => p.$isLogo ? "var(--strapi-colors-primary100)" : p.$isRelation ? "var(--strapi-colors-secondary100, var(--strapi-colors-primary100))" : "var(--strapi-colors-neutral0)"};
  border: 1px solid
    ${(p) => p.$isLogo ? "var(--strapi-colors-primary200)" : p.$isRelation ? "var(--strapi-colors-secondary200, var(--strapi-colors-primary200))" : "var(--strapi-colors-neutral200)"};
  border-radius: 6px;
  cursor: grab;
  user-select: none;
  &:active {
    cursor: grabbing;
  }
`;
const RelationLabel = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--strapi-colors-neutral700);
  background: var(--strapi-colors-neutral200);
  border: 1px solid var(--strapi-colors-neutral400);
  border-radius: 6px;
  margin-left: 8px;
  vertical-align: middle;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;
const ModalContentFieldPicker = styled(Modal.Content)`
  width: 90%;
  max-width: 420px;
`;
const FieldPickerList = styled.div`
  padding: 8px 0;
  max-height: 60vh;
  overflow-y: auto;
`;
const FieldPickerItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 14px;
  margin-bottom: 6px;
  font-family: monospace;
  font-size: 13px;
  text-align: left;
  border: 1px solid var(--strapi-colors-neutral200);
  border-radius: 6px;
  background: var(--strapi-colors-neutral0);
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
  &:hover {
    background: var(--strapi-colors-neutral100);
    border-color: var(--strapi-colors-neutral300);
  }
  &:last-child {
    margin-bottom: 0;
  }
`;
const FieldPickerItemRelation = styled(FieldPickerItem)`
  background: ${(p) => p.$isLogo ? "var(--strapi-colors-primary100)" : "var(--strapi-colors-secondary100, var(--strapi-colors-primary100))"};
  border-color: ${(p) => p.$isLogo ? "var(--strapi-colors-primary200)" : "var(--strapi-colors-secondary200, var(--strapi-colors-primary200))"};
  &:hover {
    background: ${(p) => p.$isLogo ? "var(--strapi-colors-primary200)" : "var(--strapi-colors-secondary200, var(--strapi-colors-primary200))"};
  }
`;
const Textarea = styled.textarea`
  flex: 1;
  min-height: 240px;
  font-family: monospace;
  font-size: 13px;
  padding: 14px;
  border: none;
  resize: none;
  outline: none;
  background: var(--strapi-colors-neutral0);
`;
const PreviewFrame = styled.iframe`
  flex: 1;
  min-height: 240px;
  border: none;
  background: white;
  width: 100%;
`;
styled.label`
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--strapi-colors-neutral600);
  margin-bottom: 6px;
`;
const RecipientsTagsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;
const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 12px;
  background: var(--strapi-colors-primary100);
  color: var(--strapi-colors-primary700);
  border-radius: 4px;
  gap: 6px;
`;
const BadgeDynamic = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 12px;
  font-family: monospace;
  background: var(
    --strapi-colors-secondary100,
    var(--strapi-colors-primary100)
  );
  color: var(--strapi-colors-secondary700, var(--strapi-colors-primary700));
  border: 1px solid
    var(--strapi-colors-secondary200, var(--strapi-colors-primary200));
  border-radius: 4px;
  gap: 6px;
`;
const BadgeRemove = styled.button`
  padding: 0;
  margin: 0;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--strapi-colors-neutral600);
  font-size: 14px;
  line-height: 1;
  &:hover {
    color: var(--strapi-colors-danger600);
  }
`;
const RelationBadgeInTag = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  margin-left: 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--strapi-colors-neutral700);
  background: var(--strapi-colors-neutral200);
  border: 1px solid var(--strapi-colors-neutral400);
  border-radius: 6px;
  cursor: pointer;
  vertical-align: middle;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  &:hover {
    background: var(--strapi-colors-neutral300);
    border-color: var(--strapi-colors-neutral500);
  }
`;
function getByPath(obj, path) {
  if (path === "") return obj;
  const parts = path.split(".").filter(Boolean);
  let current = obj;
  for (const p of parts) {
    if (current == null || typeof current !== "object") return void 0;
    current = current[p];
  }
  return current;
}
function replacePlaceholders(template, params) {
  const regex = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;
  return template.replace(regex, (_, path) => {
    const value = getByPath(params, path.trim());
    if (value != null && typeof value === "object" && !Array.isArray(value) && "url" in value) {
      return String(value.url ?? "");
    }
    if (Array.isArray(value)) {
      return value.map(
        (v) => v && typeof v === "object" && "url" in v ? v.url : String(v)
      ).join(", ");
    }
    return String(value ?? `{{${path}}}`);
  });
}
function wrapHtml(html) {
  const t = html.trim();
  if (t.toLowerCase().startsWith("<!doctype") || t.toLowerCase().startsWith("<html"))
    return html;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:12px;">${html}</body></html>`;
}
function parseRecipients(value) {
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}
function formatRecipients(emails) {
  return emails.join(", ");
}
function getPlaceholderRootKey(placeholder) {
  const match = placeholder.trim().match(/\{\{\s*([^}.]+)/);
  return match ? match[1].trim() : "";
}
function TemplateModal({
  contentTypeUid,
  attributes,
  displayName,
  trigger,
  saveError = null,
  openaiApiKeySet = false,
  defaultTemplateCode,
  onClose,
  onDismissError,
  onSave,
  onSaved
}) {
  const intl = useIntl();
  const { get, post, put } = useFetchClient();
  const isDefaultTemplate = Boolean(defaultTemplateCode);
  const [subject, setSubject] = useState(trigger?.subject ?? "");
  const [html, setHtml] = useState(trigger?.html ?? "");
  const [recipientsStr, setRecipientsStr] = useState(trigger?.recipients ?? "");
  const [recipientsInputValue, setRecipientsInputValue] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const textareaRef = useRef(null);
  const subjectInputRef = useRef(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [htmlEditorOpen, setHtmlEditorOpen] = useState(false);
  const [fieldPickerFor, setFieldPickerFor] = useState(null);
  const [recipientDynamicHint, setRecipientDynamicHint] = useState(null);
  const [depthModalFor, setDepthModalFor] = useState(null);
  const [depthAttributes, setDepthAttributes] = useState(
    []
  );
  const [depthLoading, setDepthLoading] = useState(false);
  const [depthPickerFromFieldPicker, setDepthPickerFromFieldPicker] = useState(null);
  const [depthModalForHtml, setDepthModalForHtml] = useState(null);
  const [depthAttributesForPicker, setDepthAttributesForPicker] = useState([]);
  const [depthLoadingForPicker, setDepthLoadingForPicker] = useState(false);
  const [depthAttributesForHtmlDrop, setDepthAttributesForHtmlDrop] = useState([]);
  const [depthLoadingForHtmlDrop, setDepthLoadingForHtmlDrop] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [templateMode, setTemplateMode] = useState(
    trigger?.templateMode ?? "html"
  );
  const [brevoTemplateIdStr, setBrevoTemplateIdStr] = useState(
    trigger?.brevoTemplateId != null ? String(trigger.brevoTemplateId) : ""
  );
  const [savingDefault, setSavingDefault] = useState(false);
  const [defaultTemplateLoading, setDefaultTemplateLoading] = useState(isDefaultTemplate);
  const [errors, setErrors] = useState({});
  const recipientsList = useMemo(
    () => parseRecipients(recipientsStr),
    [recipientsStr]
  );
  const isPlaceholder = (value) => /^\s*\{\{[^}]+\}\}\s*$/.test(value);
  const isRelationPlaceholder = (value) => {
    if (!isPlaceholder(value)) return false;
    const rootKey = getPlaceholderRootKey(value);
    const attr = attributes.find((a) => a.name === rootKey);
    return attr && (attr.kind === "relation" || attr.kind === "media" || attr.kind === "component");
  };
  useEffect(() => {
    if (depthModalFor === null) return;
    const placeholder = recipientsList[depthModalFor];
    const rootKey = getPlaceholderRootKey(placeholder ?? "");
    if (!rootKey) {
      setDepthAttributes([]);
      return;
    }
    setDepthLoading(true);
    const base = "/brevo-template-sender";
    get(
      `${base}/depth-attributes?contentTypeUid=${encodeURIComponent(contentTypeUid)}&attributeName=${encodeURIComponent(rootKey)}`
    ).then((res) => {
      const list = res?.data?.attributes ?? [];
      setDepthAttributes(Array.isArray(list) ? list : []);
    }).finally(() => setDepthLoading(false));
  }, [depthModalFor, contentTypeUid, get, recipientsList]);
  useEffect(() => {
    if (depthPickerFromFieldPicker === null) return;
    const { rootKey } = depthPickerFromFieldPicker;
    setDepthLoadingForPicker(true);
    const base = "/brevo-template-sender";
    get(
      `${base}/depth-attributes?contentTypeUid=${encodeURIComponent(contentTypeUid)}&attributeName=${encodeURIComponent(rootKey)}`
    ).then((res) => {
      const list = res?.data?.attributes ?? [];
      setDepthAttributesForPicker(Array.isArray(list) ? list : []);
    }).finally(() => setDepthLoadingForPicker(false));
  }, [depthPickerFromFieldPicker, contentTypeUid, get]);
  useEffect(() => {
    if (depthModalForHtml === null) return;
    const { rootKey } = depthModalForHtml;
    setDepthLoadingForHtmlDrop(true);
    const base = "/brevo-template-sender";
    get(
      `${base}/depth-attributes?contentTypeUid=${encodeURIComponent(contentTypeUid)}&attributeName=${encodeURIComponent(rootKey)}`
    ).then((res) => {
      const list = res?.data?.attributes ?? [];
      setDepthAttributesForHtmlDrop(Array.isArray(list) ? list : []);
    }).finally(() => setDepthLoadingForHtmlDrop(false));
  }, [depthModalForHtml, contentTypeUid, get]);
  const initialHtml = trigger?.html ?? "";
  useEffect(() => {
    if (isDefaultTemplate) return;
    if (!initialHtml.trim()) {
      const greeting = intl.formatMessage({
        id: "brevo-template-sender.modal.defaultTemplateGreeting",
        defaultMessage: "Hello,"
      });
      const body = intl.formatMessage({
        id: "brevo-template-sender.modal.defaultTemplateBody",
        defaultMessage: "Content of your message..."
      });
      setHtml(getDefaultEmailTemplateHtml(greeting, body));
    }
  }, [initialHtml, intl, isDefaultTemplate]);
  useEffect(() => {
    if (!defaultTemplateCode) return;
    let cancelled = false;
    setDefaultTemplateLoading(true);
    const base = "/brevo-template-sender";
    get(
      `${base}/default-template?code=${encodeURIComponent(defaultTemplateCode)}`
    ).then((res) => {
      if (cancelled) return;
      const raw = res?.data ?? res;
      const t = raw?.template;
      if (t) {
        setSubject(t.subject ?? "");
        setHtml(t.html ?? "");
        setTemplateMode(t.templateMode === "brevo" ? "brevo" : "html");
        setBrevoTemplateIdStr(
          t.brevoTemplateId != null ? String(t.brevoTemplateId) : ""
        );
        setRecipientsStr(t.recipients ?? "");
      } else {
        setSubject("");
        setHtml(
          getDefaultEmailTemplateHtml(
            intl.formatMessage({
              id: "brevo-template-sender.modal.defaultTemplateGreeting",
              defaultMessage: "Hello,"
            }),
            intl.formatMessage({
              id: "brevo-template-sender.modal.defaultTemplateBody",
              defaultMessage: "Content of your message..."
            })
          )
        );
        setTemplateMode("html");
        setBrevoTemplateIdStr("");
      }
    }).catch(() => {
      if (!cancelled) setHtml("<p>Hello {{firstname}}</p>");
    }).finally(() => {
      if (!cancelled) setDefaultTemplateLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [defaultTemplateCode, get, intl]);
  useEffect(() => {
    let cancelled = false;
    const backendUrl = typeof window?.strapi?.backendURL === "string" ? window.strapi.backendURL.replace(/\/$/, "") : window.location.origin;
    Promise.all([
      get("/admin/project-settings").catch(() => ({ data: null })),
      get("/brevo-template-sender/settings").catch(() => ({ data: null }))
    ]).then(([projectRes, brevoRes]) => {
      if (cancelled) return;
      const menuLogoUrl = projectRes?.data?.menuLogo?.url;
      const brevoLogoUrl = brevoRes?.data?.logoUrl;
      const resolved = typeof menuLogoUrl === "string" && menuLogoUrl.trim() && `${backendUrl}${menuLogoUrl.trim().startsWith("/") ? "" : "/"}${menuLogoUrl.trim()}` || (typeof brevoLogoUrl === "string" && brevoLogoUrl.trim() ? brevoLogoUrl.trim() : "");
      setLogoUrl(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, [get]);
  const params = useMemo(
    () => ({
      ...Object.fromEntries(
        attributes.map((a) => [
          a.name,
          SAMPLE[a.name] ?? (a.kind === "media" ? { url: "https://via.placeholder.com/120x40" } : a.kind !== "scalar" ? { title: `(${a.name})`, url: "#" } : `(${a.name})`)
        ])
      ),
      logo_url: logoUrl || "https://via.placeholder.com/120x40?text=Logo"
    }),
    [attributes, logoUrl]
  );
  useEffect(() => {
    const out = replacePlaceholders(html, params);
    setPreviewHtml(wrapHtml(out));
  }, [html, params]);
  const fields = useMemo(
    () => [
      {
        key: "logo_url",
        label: "{{logo_url}}",
        isLogo: true,
        kind: "scalar"
      },
      ...attributes.map((a) => ({
        key: a.name,
        label: `{{${a.name}}}`,
        hint: a.kind === "media" ? `→ ex: {{${a.name}.url}}` : a.kind === "relation" || a.kind === "component" ? `→ ex: {{${a.name}.title}} ou {{${a.name}.slug}}` : void 0,
        kind: a.kind,
        type: a.type,
        target: a.target
      }))
    ],
    [attributes]
  );
  const handleDrop = (e) => {
    e.preventDefault();
    const text = e.dataTransfer.getData("text/plain");
    const ta = textareaRef.current;
    if (!ta || !text) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    if (isRelationPlaceholder(text)) {
      const rootKey = getPlaceholderRootKey(text);
      if (rootKey)
        setDepthModalForHtml({ rootKey, insertStart: start, insertEnd: end });
      return;
    }
    const before = html.slice(0, start);
    const after = html.slice(end);
    setHtml(before + text + after);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };
  const handleGenerateWithAi = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const base = "/brevo-template-sender";
      const res = await post(`${base}/generate-html`, {
        prompt: aiPrompt.trim(),
        currentHtml: html || void 0
      });
      const data = res?.data ?? res;
      const generated = typeof data?.html === "string" ? data.html : null;
      if (generated) {
        setHtml(generated);
        setAiModalOpen(false);
        setAiPrompt("");
      } else {
        setAiError(
          intl.formatMessage({
            id: "brevo-template-sender.ai.generateError",
            defaultMessage: "Invalid response from server."
          })
        );
      }
    } catch (err) {
      const msg = err?.response?.data?.error ?? err?.message ?? intl.formatMessage({
        id: "brevo-template-sender.ai.generateError",
        defaultMessage: "Failed to generate."
      });
      setAiError(typeof msg === "string" ? msg : "Failed to generate.");
    } finally {
      setAiLoading(false);
    }
  };
  const addRecipient = (email) => {
    const trimmed = email.trim();
    if (!trimmed) return;
    if (/^\s*\{\{[^}]+\}\}\s*$/.test(trimmed)) {
      setRecipientDynamicHint(
        intl.formatMessage({
          id: "brevo-template-sender.modal.recipientsUseDynamicButton",
          defaultMessage: "Use the { } button to add dynamic fields from the content type."
        })
      );
      return;
    }
    setRecipientDynamicHint(null);
    const next = [...recipientsList, trimmed];
    setRecipientsStr(formatRecipients(next));
    setRecipientsInputValue("");
    if (errors.recipients)
      setErrors((prev) => ({ ...prev, recipients: void 0 }));
  };
  const addRecipientPlaceholder = (placeholder) => {
    const trimmed = placeholder.trim();
    if (!trimmed) return;
    const next = [...recipientsList, trimmed];
    setRecipientsStr(formatRecipients(next));
    if (errors.recipients)
      setErrors((prev) => ({ ...prev, recipients: void 0 }));
  };
  const insertIntoSubject = (placeholder) => {
    const trimmed = placeholder.trim();
    if (!trimmed) return;
    const input = subjectInputRef.current;
    if (input && typeof input.selectionStart === "number") {
      const start = input.selectionStart ?? subject.length;
      const end = input.selectionEnd ?? start;
      setSubject(subject.slice(0, start) + trimmed + subject.slice(end));
      setFieldPickerFor(null);
      setTimeout(() => {
        input.focus();
        const newPos = start + trimmed.length;
        input.setSelectionRange(newPos, newPos);
      }, 0);
    } else {
      setSubject((prev) => prev + trimmed);
      setFieldPickerFor(null);
      setTimeout(() => subjectInputRef.current?.focus(), 0);
    }
  };
  const insertIntoHtml = (placeholder) => {
    const trimmed = placeholder.trim();
    if (!trimmed) return;
    const ta = textareaRef.current;
    if (ta && typeof ta.selectionStart === "number") {
      const start = ta.selectionStart;
      const end = ta.selectionEnd ?? start;
      setHtml(html.slice(0, start) + trimmed + html.slice(end));
      setFieldPickerFor(null);
      setTimeout(() => {
        ta.focus();
        const newPos = start + trimmed.length;
        ta.setSelectionRange(newPos, newPos);
      }, 0);
    } else {
      setHtml((prev) => prev + trimmed);
      setFieldPickerFor(null);
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  };
  const handleFieldPickerSelect = (placeholder) => {
    if (fieldPickerFor === "recipients") addRecipientPlaceholder(placeholder);
    else if (fieldPickerFor === "subject") insertIntoSubject(placeholder);
    else if (fieldPickerFor === "html") insertIntoHtml(placeholder);
    setFieldPickerFor(null);
  };
  const handleDepthAttributeFromPicker = (attrName) => {
    if (depthPickerFromFieldPicker === null) return;
    const { rootKey, context } = depthPickerFromFieldPicker;
    const placeholder = `{{${rootKey}.${attrName}}}`;
    if (context === "recipients") addRecipientPlaceholder(placeholder);
    else if (context === "subject") insertIntoSubject(placeholder);
    else if (context === "html") insertIntoHtml(placeholder);
    setDepthPickerFromFieldPicker(null);
    setFieldPickerFor(null);
  };
  const applyDepthAttributeForHtmlDrop = (attrName) => {
    if (depthModalForHtml === null) return;
    const { rootKey, insertStart, insertEnd } = depthModalForHtml;
    const placeholder = `{{${rootKey}.${attrName}}}`;
    setHtml(html.slice(0, insertStart) + placeholder + html.slice(insertEnd));
    setDepthModalForHtml(null);
    setTimeout(() => {
      textareaRef.current?.focus();
      const newPos = insertStart + placeholder.length;
      textareaRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  };
  const removeRecipient = (index) => {
    const next = recipientsList.filter((_, i) => i !== index);
    setRecipientsStr(formatRecipients(next));
  };
  const applyDepthAttribute = (attrName) => {
    if (depthModalFor === null) return;
    const placeholder = recipientsList[depthModalFor];
    const rootKey = getPlaceholderRootKey(placeholder ?? "");
    if (!rootKey) return;
    const newPlaceholder = `{{${rootKey}.${attrName}}}`;
    const next = recipientsList.map(
      (item, i) => i === depthModalFor ? newPlaceholder : item
    );
    setRecipientsStr(formatRecipients(next));
    setDepthModalFor(null);
  };
  const handleRecipientsKeyDown = (e) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      if (recipientsInputValue.trim()) addRecipient(recipientsInputValue);
    }
  };
  const handleRecipientsBlur = () => {
    if (recipientsInputValue.trim()) addRecipient(recipientsInputValue);
  };
  const openHtmlEditor = () => {
    if (!html.trim()) {
      const greeting = intl.formatMessage({
        id: "brevo-template-sender.modal.defaultTemplateGreeting",
        defaultMessage: "Hello,"
      });
      const body = intl.formatMessage({
        id: "brevo-template-sender.modal.defaultTemplateBody",
        defaultMessage: "Content of your message..."
      });
      setHtml(getDefaultEmailTemplateHtml(greeting, body));
    }
    setHtmlEditorOpen(true);
  };
  const handleSave = async () => {
    const brevoId = brevoTemplateIdStr.trim() ? parseInt(brevoTemplateIdStr.trim(), 10) : void 0;
    const newErrors = {};
    if (templateMode === "html" && !subject.trim()) {
      newErrors.subject = intl.formatMessage({
        id: "brevo-template-sender.modal.subjectRequired",
        defaultMessage: "Subject is required."
      });
    }
    if (templateMode === "brevo" && (!Number.isFinite(brevoId) || (brevoId ?? 0) <= 0)) {
      newErrors.brevoTemplateId = intl.formatMessage({
        id: "brevo-template-sender.modal.brevoTemplateIdRequired",
        defaultMessage: "A valid Brevo template ID is required."
      });
    }
    if (recipientsList.length === 0) {
      newErrors.recipients = intl.formatMessage({
        id: "brevo-template-sender.modal.recipientsRequired",
        defaultMessage: "At least one recipient is required."
      });
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    if (isDefaultTemplate && defaultTemplateCode) {
      setSavingDefault(true);
      try {
        const base = "/brevo-template-sender";
        const body = {
          code: defaultTemplateCode,
          name: "Send Email Default",
          subject: subject.trim() || "Message",
          html: templateMode === "html" ? html.trim() : "<p></p>",
          templateMode,
          brevoTemplateId: templateMode === "brevo" && Number.isFinite(brevoId) ? brevoId : void 0,
          recipients: recipientsStr.trim() || void 0
        };
        await put(`${base}/default-template`, body);
        onSaved?.();
        onClose();
      } finally {
        setSavingDefault(false);
      }
      return;
    }
    onSave({
      id: trigger?.id ?? `${contentTypeUid}::create`,
      contentTypeUid,
      event: trigger?.event ?? "create",
      subject,
      html,
      sendToField: trigger?.sendToField,
      recipients: recipientsStr.trim() || void 0,
      templateMode,
      brevoTemplateId: Number.isFinite(brevoId) ? brevoId : void 0
    });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Modal.Root, { open: true, onOpenChange: (open) => !open && onClose(), children: /* @__PURE__ */ jsxs(ModalContentLarge, { labelledBy: "template-modal-title", children: [
      /* @__PURE__ */ jsx(Modal.Header, { children: /* @__PURE__ */ jsx(Typography, { id: "template-modal-title", variant: "beta", as: "h2", children: intl.formatMessage(
        {
          id: "brevo-template-sender.modal.title",
          defaultMessage: "Template: {name}"
        },
        { name: displayName }
      ) }) }),
      /* @__PURE__ */ jsx(Modal.Body, { children: defaultTemplateLoading ? /* @__PURE__ */ jsx(Flex, { padding: 6, justifyContent: "center", children: /* @__PURE__ */ jsx(Loader, {}) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        saveError && /* @__PURE__ */ jsx(
          Alert,
          {
            variant: "danger",
            marginBottom: 4,
            onClose: onDismissError,
            closeLabel: intl.formatMessage({
              id: "app.components.Button.close",
              defaultMessage: "Close"
            }),
            children: saveError
          }
        ),
        /* @__PURE__ */ jsxs(Flex, { gap: 2, marginBottom: 4, children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: templateMode === "html" ? "default" : "tertiary",
              size: "S",
              onClick: () => setTemplateMode("html"),
              children: intl.formatMessage({
                id: "brevo-template-sender.modal.modeHtml",
                defaultMessage: "HTML"
              })
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: templateMode === "brevo" ? "default" : "tertiary",
              size: "S",
              onClick: () => setTemplateMode("brevo"),
              children: intl.formatMessage({
                id: "brevo-template-sender.modal.modeBrevo",
                defaultMessage: "Template Brevo"
              })
            }
          )
        ] }),
        templateMode === "brevo" && /* @__PURE__ */ jsx(Box, { paddingBottom: 4, children: /* @__PURE__ */ jsxs(
          Field.Root,
          {
            id: "brevo-template-id",
            error: errors.brevoTemplateId,
            required: true,
            children: [
              /* @__PURE__ */ jsx(Field.Label, { children: intl.formatMessage({
                id: "brevo-template-sender.modal.brevoTemplateId",
                defaultMessage: "ID du template Brevo"
              }) }),
              /* @__PURE__ */ jsx(Field.Hint, { children: intl.formatMessage({
                id: "brevo-template-sender.modal.brevoTemplateIdHint",
                defaultMessage: "Saisissez l'ID du template créé dans Brevo (Campagnes → Templates)."
              }) }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "brevo-template-id",
                  type: "number",
                  value: brevoTemplateIdStr,
                  onChange: (e) => {
                    setBrevoTemplateIdStr(e.target.value);
                    if (errors.brevoTemplateId)
                      setErrors((prev) => ({
                        ...prev,
                        brevoTemplateId: void 0
                      }));
                  },
                  placeholder: "123",
                  size: "M"
                }
              ),
              /* @__PURE__ */ jsx(Field.Error, {})
            ]
          }
        ) }),
        templateMode === "html" && /* @__PURE__ */ jsx(Box, { paddingBottom: 4, children: /* @__PURE__ */ jsxs(Field.Root, { id: "subject", error: errors.subject, required: true, children: [
          /* @__PURE__ */ jsx(Field.Label, { children: intl.formatMessage({
            id: "brevo-template-sender.modal.subject",
            defaultMessage: "Subject"
          }) }),
          /* @__PURE__ */ jsxs(Flex, { gap: 2, alignItems: "stretch", children: [
            /* @__PURE__ */ jsx(Box, { flex: "1", minWidth: 0, children: /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "subject",
                ref: subjectInputRef,
                value: subject,
                onChange: (e) => {
                  setSubject(e.target.value);
                  if (errors.subject)
                    setErrors((prev) => ({
                      ...prev,
                      subject: void 0
                    }));
                },
                placeholder: "E.g. New message {{email}}",
                size: "M"
              }
            ) }),
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                variant: "tertiary",
                size: "M",
                style: { minHeight: 40 },
                onClick: () => setFieldPickerFor("subject"),
                title: intl.formatMessage({
                  id: "brevo-template-sender.modal.recipientsDynamicTitle",
                  defaultMessage: "Insert dynamic field from content type"
                }),
                children: intl.formatMessage({
                  id: "brevo-template-sender.modal.recipientsDynamicButton",
                  defaultMessage: "{ }"
                })
              }
            )
          ] }),
          /* @__PURE__ */ jsx(Field.Error, {})
        ] }) }),
        /* @__PURE__ */ jsx(Box, { paddingBottom: 5, children: /* @__PURE__ */ jsxs(
          Field.Root,
          {
            id: "template-recipients",
            error: errors.recipients,
            required: true,
            hint: intl.formatMessage({
              id: "brevo-template-sender.modal.recipientsHint",
              defaultMessage: "Enter an address then click « Add » or press Enter. Addresses appear as tags below. Use the { } button for dynamic fields."
            }),
            children: [
              /* @__PURE__ */ jsx(Field.Label, { children: intl.formatMessage({
                id: "brevo-template-sender.modal.recipientsLabel",
                defaultMessage: "Recipients"
              }) }),
              /* @__PURE__ */ jsx(Field.Hint, {}),
              /* @__PURE__ */ jsxs(Flex, { gap: 2, alignItems: "stretch", children: [
                /* @__PURE__ */ jsx(Box, { flex: "1", minWidth: 0, children: /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    id: "template-recipients-input",
                    type: "text",
                    value: recipientsInputValue,
                    onChange: (e) => setRecipientsInputValue(e.target.value),
                    onKeyDown: handleRecipientsKeyDown,
                    onBlur: handleRecipientsBlur,
                    placeholder: "email@example.com",
                    size: "M"
                  }
                ) }),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    variant: "tertiary",
                    size: "M",
                    style: { minHeight: 40 },
                    onClick: () => setFieldPickerFor("recipients"),
                    title: intl.formatMessage({
                      id: "brevo-template-sender.modal.recipientsDynamicTitle",
                      defaultMessage: "Insert dynamic field from content type"
                    }),
                    children: intl.formatMessage({
                      id: "brevo-template-sender.modal.recipientsDynamicButton",
                      defaultMessage: "{ }"
                    })
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    variant: "tertiary",
                    size: "M",
                    style: { minHeight: 40 },
                    onClick: () => addRecipient(recipientsInputValue),
                    children: intl.formatMessage({
                      id: "brevo-template-sender.modal.recipientsAdd",
                      defaultMessage: "Add"
                    })
                  }
                )
              ] }),
              recipientsList.length > 0 && /* @__PURE__ */ jsx(RecipientsTagsRow, { children: recipientsList.map((item, i) => {
                const dynamic = isPlaceholder(item);
                const relationPlaceholder = dynamic && isRelationPlaceholder(item);
                const B = dynamic ? BadgeDynamic : Badge;
                return /* @__PURE__ */ jsxs(B, { children: [
                  item,
                  relationPlaceholder && /* @__PURE__ */ jsx(
                    RelationBadgeInTag,
                    {
                      type: "button",
                      onClick: (e) => {
                        e.stopPropagation();
                        setDepthModalFor(i);
                      },
                      title: intl.formatMessage({
                        id: "brevo-template-sender.modal.relationDepthTitle",
                        defaultMessage: "Choose a depth attribute"
                      }),
                      children: "Relation"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    BadgeRemove,
                    {
                      type: "button",
                      onClick: () => removeRecipient(i),
                      "aria-label": intl.formatMessage({
                        id: "brevo-template-sender.modal.removeRecipient",
                        defaultMessage: "Remove"
                      }),
                      children: "×"
                    }
                  )
                ] }, `${item}-${i}`);
              }) }),
              /* @__PURE__ */ jsx(Field.Error, {})
            ]
          }
        ) }),
        templateMode === "html" && /* @__PURE__ */ jsxs(PreviewOnlyLayout, { children: [
          /* @__PURE__ */ jsxs(PreviewHeader, { children: [
            /* @__PURE__ */ jsx("span", { children: intl.formatMessage({
              id: "brevo-template-sender.modal.preview",
              defaultMessage: "Preview"
            }) }),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "tertiary",
                size: "S",
                onClick: openHtmlEditor,
                children: intl.formatMessage({
                  id: "brevo-template-sender.modal.editHtmlTemplate",
                  defaultMessage: "Edit HTML Template"
                })
              }
            )
          ] }),
          /* @__PURE__ */ jsx(PreviewBody, { children: /* @__PURE__ */ jsx(
            PreviewFrame,
            {
              title: "Preview",
              srcDoc: previewHtml,
              sandbox: "allow-same-origin"
            }
          ) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "tertiary", onClick: onClose, children: intl.formatMessage({
          id: "app.components.Button.cancel",
          defaultMessage: "Cancel"
        }) }),
        /* @__PURE__ */ jsx(
          Button,
          {
            onClick: handleSave,
            loading: savingDefault,
            disabled: defaultTemplateLoading,
            children: intl.formatMessage({
              id: "app.components.Button.save",
              defaultMessage: "Save"
            })
          }
        )
      ] })
    ] }) }),
    htmlEditorOpen && /* @__PURE__ */ jsx(
      Modal.Root,
      {
        open: true,
        onOpenChange: (open) => !open && setHtmlEditorOpen(false),
        children: /* @__PURE__ */ jsxs(ModalContentHtmlEditor, { labelledBy: "html-editor-modal-title", children: [
          /* @__PURE__ */ jsx(Modal.Header, { children: /* @__PURE__ */ jsx(Typography, { id: "html-editor-modal-title", variant: "beta", as: "h2", children: intl.formatMessage({
            id: "brevo-template-sender.modal.editHtmlTemplateTitle",
            defaultMessage: "Edit HTML template"
          }) }) }),
          /* @__PURE__ */ jsx(Modal.Body, { children: /* @__PURE__ */ jsx(GridLayoutHtmlEditor, { children: /* @__PURE__ */ jsxs(Column, { children: [
            /* @__PURE__ */ jsxs(
              Flex,
              {
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 2,
                wrap: "wrap",
                gap: 2,
                children: [
                  /* @__PURE__ */ jsxs(Flex, { alignItems: "center", gap: 2, children: [
                    /* @__PURE__ */ jsx(ColumnLabel, { as: "span", children: intl.formatMessage({
                      id: "brevo-template-sender.modal.html",
                      defaultMessage: "Message (HTML)"
                    }) }),
                    /* @__PURE__ */ jsx(
                      Button,
                      {
                        type: "button",
                        variant: "tertiary",
                        size: "M",
                        style: { minHeight: 32 },
                        onClick: () => setFieldPickerFor("html"),
                        title: intl.formatMessage({
                          id: "brevo-template-sender.modal.recipientsDynamicTitle",
                          defaultMessage: "Insert dynamic field from content type"
                        }),
                        children: intl.formatMessage({
                          id: "brevo-template-sender.modal.recipientsDynamicButton",
                          defaultMessage: "{ }"
                        })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      variant: "tertiary",
                      size: "S",
                      disabled: !openaiApiKeySet,
                      onClick: () => {
                        setAiError(null);
                        setAiPrompt("");
                        setAiModalOpen(true);
                      },
                      children: intl.formatMessage({
                        id: "brevo-template-sender.modal.generateWithAi",
                        defaultMessage: "Generate with AI"
                      })
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              Textarea,
              {
                ref: textareaRef,
                value: html,
                onChange: (e) => setHtml(e.target.value),
                onDragOver: (e) => e.preventDefault(),
                onDrop: handleDrop,
                placeholder: "<p>Type HTML. Use { } to insert dynamic fields.</p>"
              }
            )
          ] }) }) }),
          /* @__PURE__ */ jsxs(Modal.Footer, { children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "tertiary",
                onClick: () => setHtmlEditorOpen(false),
                children: intl.formatMessage({
                  id: "app.components.Button.cancel",
                  defaultMessage: "Cancel"
                })
              }
            ),
            /* @__PURE__ */ jsx(Button, { onClick: () => setHtmlEditorOpen(false), children: intl.formatMessage({
              id: "brevo-template-sender.modal.closeEditor",
              defaultMessage: "Close"
            }) })
          ] })
        ] })
      }
    ),
    aiModalOpen && /* @__PURE__ */ jsx(
      Modal.Root,
      {
        open: true,
        onOpenChange: (open) => !open && setAiModalOpen(false),
        children: /* @__PURE__ */ jsxs(
          Modal.Content,
          {
            labelledBy: "ai-generate-title",
            style: { maxWidth: 520 },
            children: [
              /* @__PURE__ */ jsx(Modal.Header, { children: /* @__PURE__ */ jsx(Typography, { id: "ai-generate-title", variant: "beta", as: "h2", children: intl.formatMessage({
                id: "brevo-template-sender.modal.generateWithAi",
                defaultMessage: "Generate with AI"
              }) }) }),
              /* @__PURE__ */ jsxs(Modal.Body, { children: [
                aiError && /* @__PURE__ */ jsx(
                  Alert,
                  {
                    variant: "danger",
                    marginBottom: 3,
                    onClose: () => setAiError(null),
                    closeLabel: "Close",
                    children: aiError
                  }
                ),
                /* @__PURE__ */ jsxs(Field.Root, { children: [
                  /* @__PURE__ */ jsx(Field.Label, { children: intl.formatMessage({
                    id: "brevo-template-sender.ai.promptLabel",
                    defaultMessage: "Describe the email template you want (or how to improve the current one)"
                  }) }),
                  /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      placeholder: intl.formatMessage({
                        id: "brevo-template-sender.ai.promptPlaceholder",
                        defaultMessage: "e.g. Confirmation email with logo, greeting and {{firstname}}"
                      }),
                      value: aiPrompt,
                      onChange: (e) => setAiPrompt(e.target.value),
                      disabled: aiLoading
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs(Modal.Footer, { children: [
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    variant: "tertiary",
                    onClick: () => setAiModalOpen(false),
                    disabled: aiLoading,
                    children: intl.formatMessage({
                      id: "app.components.Button.cancel",
                      defaultMessage: "Cancel"
                    })
                  }
                ),
                /* @__PURE__ */ jsx(Button, { onClick: handleGenerateWithAi, loading: aiLoading, children: intl.formatMessage({
                  id: "brevo-template-sender.ai.generate",
                  defaultMessage: "Generate"
                }) })
              ] })
            ]
          }
        )
      }
    ),
    fieldPickerFor !== null && /* @__PURE__ */ jsx(
      Modal.Root,
      {
        open: true,
        onOpenChange: (open) => {
          if (!open) {
            setFieldPickerFor(null);
            setDepthPickerFromFieldPicker(null);
          }
        },
        children: /* @__PURE__ */ jsxs(ModalContentFieldPicker, { labelledBy: "field-picker-modal-title", children: [
          /* @__PURE__ */ jsx(Modal.Header, { children: /* @__PURE__ */ jsx(Typography, { id: "field-picker-modal-title", variant: "beta", as: "h2", children: depthPickerFromFieldPicker ? intl.formatMessage(
            {
              id: "brevo-template-sender.modal.depthModalTitle",
              defaultMessage: "Choose depth attribute for {placeholder}"
            },
            {
              placeholder: `{{${depthPickerFromFieldPicker.rootKey}}}`
            }
          ) : intl.formatMessage({
            id: "brevo-template-sender.modal.recipientsFieldPickerTitle",
            defaultMessage: "Insert dynamic field"
          }) }) }),
          /* @__PURE__ */ jsx(Modal.Body, { children: depthPickerFromFieldPicker ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              Typography,
              {
                variant: "pi",
                textColor: "neutral600",
                marginBottom: 3,
                children: intl.formatMessage({
                  id: "brevo-template-sender.modal.depthModalHint",
                  defaultMessage: "Click an attribute to use it (e.g. {{relation.id}}, {{relation.url}})."
                })
              }
            ),
            depthLoadingForPicker ? /* @__PURE__ */ jsx(Flex, { padding: 6, justifyContent: "center", children: /* @__PURE__ */ jsx(Loader, {}) }) : /* @__PURE__ */ jsx(FieldPickerList, { children: depthAttributesForPicker.map((attr) => {
              const rootKey = depthPickerFromFieldPicker.rootKey;
              const label = `{{${rootKey}.${attr.name}}}`;
              return /* @__PURE__ */ jsx(Box, { marginBottom: 2, children: /* @__PURE__ */ jsx(
                FieldPickerItem,
                {
                  type: "button",
                  onClick: () => handleDepthAttributeFromPicker(attr.name),
                  children: label
                }
              ) }, attr.name);
            }) })
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              Typography,
              {
                variant: "pi",
                textColor: "neutral600",
                marginBottom: 3,
                children: fieldPickerFor === "subject" ? intl.formatMessage({
                  id: "brevo-template-sender.modal.subjectFieldPickerHint",
                  defaultMessage: "Choose a field to insert into the subject line."
                }) : fieldPickerFor === "html" ? intl.formatMessage({
                  id: "brevo-template-sender.modal.htmlFieldPickerHint",
                  defaultMessage: "Choose a field to insert into the HTML content (e.g. {{firstname}}, {{relation.url}})."
                }) : intl.formatMessage({
                  id: "brevo-template-sender.modal.recipientsFieldPickerHint",
                  defaultMessage: "Choose a field from the content type. Its value will be used as recipient at send time."
                })
              }
            ),
            /* @__PURE__ */ jsx(FieldPickerList, { children: fields.map((f) => {
              const isRelation = f.kind === "relation" || f.kind === "component" || f.kind === "media";
              const Item = isRelation || f.key === "logo_url" ? FieldPickerItemRelation : FieldPickerItem;
              const onClick = isRelation || f.key === "logo_url" ? () => setDepthPickerFromFieldPicker({
                rootKey: f.key,
                context: fieldPickerFor
              }) : () => handleFieldPickerSelect(f.label);
              return /* @__PURE__ */ jsx(Box, { marginBottom: 2, children: /* @__PURE__ */ jsxs(
                Item,
                {
                  type: "button",
                  $isLogo: f.key === "logo_url",
                  onClick,
                  children: [
                    f.label,
                    isRelation && /* @__PURE__ */ jsx(RelationLabel, { children: "Relation" })
                  ]
                }
              ) }, f.key);
            }) })
          ] }) }),
          /* @__PURE__ */ jsxs(Modal.Footer, { children: [
            depthPickerFromFieldPicker ? /* @__PURE__ */ jsx(
              Button,
              {
                variant: "tertiary",
                onClick: () => setDepthPickerFromFieldPicker(null),
                children: intl.formatMessage({
                  id: "brevo-template-sender.modal.back",
                  defaultMessage: "Back"
                })
              }
            ) : null,
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "tertiary",
                onClick: () => {
                  setFieldPickerFor(null);
                  setDepthPickerFromFieldPicker(null);
                },
                children: intl.formatMessage({
                  id: "app.components.Button.cancel",
                  defaultMessage: "Cancel"
                })
              }
            )
          ] })
        ] })
      }
    ),
    depthModalFor !== null && /* @__PURE__ */ jsx(
      Modal.Root,
      {
        open: true,
        onOpenChange: (open) => !open && setDepthModalFor(null),
        children: /* @__PURE__ */ jsxs(ModalContentFieldPicker, { labelledBy: "depth-modal-title", children: [
          /* @__PURE__ */ jsx(Modal.Header, { children: /* @__PURE__ */ jsx(Typography, { id: "depth-modal-title", variant: "beta", as: "h2", children: intl.formatMessage(
            {
              id: "brevo-template-sender.modal.depthModalTitle",
              defaultMessage: "Choose depth attribute for {placeholder}"
            },
            { placeholder: recipientsList[depthModalFor] ?? "" }
          ) }) }),
          /* @__PURE__ */ jsxs(Modal.Body, { children: [
            /* @__PURE__ */ jsx(Typography, { variant: "pi", textColor: "neutral600", marginBottom: 3, children: intl.formatMessage({
              id: "brevo-template-sender.modal.depthModalHint",
              defaultMessage: "Click an attribute to use it (e.g. {{relation.id}}, {{relation.url}})."
            }) }),
            depthLoading ? /* @__PURE__ */ jsx(Flex, { padding: 6, justifyContent: "center", children: /* @__PURE__ */ jsx(Loader, {}) }) : /* @__PURE__ */ jsx(FieldPickerList, { children: depthAttributes.map((attr) => {
              const rootKey = getPlaceholderRootKey(
                recipientsList[depthModalFor] ?? ""
              );
              const label = `{{${rootKey}.${attr.name}}}`;
              return /* @__PURE__ */ jsx(Box, { marginBottom: 2, children: /* @__PURE__ */ jsx(
                FieldPickerItem,
                {
                  type: "button",
                  onClick: () => applyDepthAttribute(attr.name),
                  children: label
                }
              ) }, attr.name);
            }) })
          ] }),
          /* @__PURE__ */ jsx(Modal.Footer, { children: /* @__PURE__ */ jsx(Button, { variant: "tertiary", onClick: () => setDepthModalFor(null), children: intl.formatMessage({
            id: "app.components.Button.cancel",
            defaultMessage: "Cancel"
          }) }) })
        ] })
      }
    ),
    depthModalForHtml !== null && /* @__PURE__ */ jsx(
      Modal.Root,
      {
        open: true,
        onOpenChange: (open) => !open && setDepthModalForHtml(null),
        children: /* @__PURE__ */ jsxs(ModalContentFieldPicker, { labelledBy: "depth-html-modal-title", children: [
          /* @__PURE__ */ jsx(Modal.Header, { children: /* @__PURE__ */ jsx(Typography, { id: "depth-html-modal-title", variant: "beta", as: "h2", children: intl.formatMessage(
            {
              id: "brevo-template-sender.modal.depthModalTitle",
              defaultMessage: "Choose depth attribute for {placeholder}"
            },
            { placeholder: `{{${depthModalForHtml.rootKey}}}` }
          ) }) }),
          /* @__PURE__ */ jsxs(Modal.Body, { children: [
            /* @__PURE__ */ jsx(Typography, { variant: "pi", textColor: "neutral600", marginBottom: 3, children: intl.formatMessage({
              id: "brevo-template-sender.modal.depthModalHint",
              defaultMessage: "Click an attribute to use it (e.g. {{relation.id}}, {{relation.url}})."
            }) }),
            depthLoadingForHtmlDrop ? /* @__PURE__ */ jsx(Flex, { padding: 6, justifyContent: "center", children: /* @__PURE__ */ jsx(Loader, {}) }) : /* @__PURE__ */ jsx(FieldPickerList, { children: depthAttributesForHtmlDrop.map((attr) => {
              const label = `{{${depthModalForHtml.rootKey}.${attr.name}}}`;
              return /* @__PURE__ */ jsx(Box, { marginBottom: 2, children: /* @__PURE__ */ jsx(
                FieldPickerItem,
                {
                  type: "button",
                  onClick: () => applyDepthAttributeForHtmlDrop(attr.name),
                  children: label
                }
              ) }, attr.name);
            }) })
          ] }),
          /* @__PURE__ */ jsx(Modal.Footer, { children: /* @__PURE__ */ jsx(
            Button,
            {
              variant: "tertiary",
              onClick: () => setDepthModalForHtml(null),
              children: intl.formatMessage({
                id: "app.components.Button.cancel",
                defaultMessage: "Cancel"
              })
            }
          ) })
        ] })
      }
    )
  ] });
}
function ConfigPage() {
  const { get, put } = useFetchClient();
  const intl = useIntl();
  const [contentTypes, setContentTypes] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [settings, setSettings] = useState({
    apiKey: "",
    apiKeySet: false,
    senderEmail: "",
    senderName: "",
    sendEmailTemplateCode: "contact",
    openaiApiKey: "",
    openaiApiKeySet: false
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [defaultTemplateModalOpen, setDefaultTemplateModalOpen] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState(null);
  const [triggerSaveError, setTriggerSaveError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalContentType, setModalContentType] = useState(null);
  const [manageContentTypesModalOpen, setManageContentTypesModalOpen] = useState(false);
  const [devSupport, setDevSupport] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const base = "/brevo-template-sender";
      const [ctRes, trRes, settingsRes] = await Promise.all([
        get(base + "/content-types"),
        get(base + "/triggers"),
        get(base + "/settings")
      ]);
      const ctData = ctRes?.data ?? ctRes;
      const trData = trRes?.data ?? trRes;
      const settingsData = settingsRes?.data ?? settingsRes;
      const list = Array.isArray(ctData) ? ctData : [];
      setContentTypes(
        list.map((ct) => ({
          ...ct,
          attributes: Array.isArray(ct.attributes) ? ct.attributes.map(
            (a) => typeof a === "string" ? { name: a, type: "string", kind: "scalar" } : a
          ) : []
        }))
      );
      setTriggers(Array.isArray(trData) ? trData : []);
      if (settingsData && typeof settingsData === "object") {
        setSettings({
          apiKey: "",
          apiKeySet: Boolean(settingsData.apiKeySet),
          senderEmail: String(settingsData.senderEmail ?? ""),
          senderName: String(settingsData.senderName ?? ""),
          sendEmailTemplateCode: String(
            settingsData.sendEmailTemplateCode ?? "contact"
          ),
          openaiApiKey: "",
          openaiApiKeySet: Boolean(settingsData.openaiApiKeySet)
        });
        setDevSupport({
          isDevelopment: Boolean(settingsData.isDevelopment),
          supportRepoUrl: String(
            settingsData.supportRepoUrl ?? "https://github.com/calistock/strapi-plugin-brevo-template-sender"
          ),
          supportBmcUrl: String(
            settingsData.supportBmcUrl ?? "https://buymeacoffee.com/dupflo"
          )
        });
      }
    } finally {
      setLoading(false);
    }
  }, [get]);
  const saveSettings = async () => {
    setSavingSettings(true);
    setSettingsMessage(null);
    try {
      const base = "/brevo-template-sender";
      const body = {
        senderEmail: settings.senderEmail,
        senderName: settings.senderName
      };
      if (settings.apiKey) body.apiKey = settings.apiKey;
      body.openaiApiKey = settings.openaiApiKey ?? "";
      await put(base + "/settings", body);
      setSettings((s) => ({
        ...s,
        apiKey: "",
        apiKeySet: s.apiKeySet || Boolean(settings.apiKey)
      }));
      setSettingsMessage({
        type: "success",
        text: intl.formatMessage({
          id: "brevo-template-sender.settings.savedSuccess",
          defaultMessage: "Settings saved."
        })
      });
    } catch (e) {
      setSettingsMessage({
        type: "error",
        text: e?.message ?? intl.formatMessage({
          id: "brevo-template-sender.settings.savedError",
          defaultMessage: "Failed to save settings."
        })
      });
    } finally {
      setSavingSettings(false);
    }
  };
  useEffect(() => {
    load();
  }, [load]);
  const hasTrigger = (uid, event) => triggers.some((t) => t.contentTypeUid === uid && t.event === event);
  const toggleTrigger = async (contentTypeUid, event, checked) => {
    const existingForCt = triggers.filter(
      (t) => t.contentTypeUid === contentTypeUid
    );
    const template = existingForCt[0] ?? null;
    let next = triggers.filter(
      (t) => !(t.contentTypeUid === contentTypeUid && t.event === event)
    );
    if (checked) {
      next = [
        ...next,
        {
          id: makeId(contentTypeUid, event),
          contentTypeUid,
          event,
          subject: template?.subject ?? "",
          html: template?.html ?? "",
          sendToField: template?.sendToField,
          recipients: template?.recipients,
          templateMode: template?.templateMode ?? "html",
          brevoTemplateId: template?.brevoTemplateId
        }
      ];
    }
    setTriggers(next);
    try {
      const base = "/brevo-template-sender";
      await put(base + "/triggers", { body: { triggers: next } });
    } catch (e) {
      setTriggers(triggers);
    }
  };
  const getTemplateForContentType = (uid) => triggers.find((t) => t.contentTypeUid === uid) ?? null;
  const openModal = (ct, closeManageModal = false) => {
    if (closeManageModal) setManageContentTypesModalOpen(false);
    const trigger = getTemplateForContentType(ct.uid) ?? null;
    setModalContentType({
      contentTypeUid: ct.uid,
      attributes: ct.attributes,
      displayName: ct.displayName,
      trigger
    });
  };
  const selectedContentTypes = useMemo(
    () => contentTypes.filter(
      (ct) => triggers.some((t) => t.contentTypeUid === ct.uid)
    ),
    [contentTypes, triggers]
  );
  const saveTrigger = async (updated) => {
    setTriggerSaveError(null);
    const baseTrigger = {
      subject: updated.subject,
      html: updated.html,
      sendToField: updated.sendToField,
      recipients: updated.recipients,
      templateMode: updated.templateMode ?? "html",
      brevoTemplateId: updated.brevoTemplateId
    };
    const next = triggers.map(
      (t) => t.contentTypeUid === updated.contentTypeUid ? { ...t, ...baseTrigger, id: t.id } : t
    );
    try {
      const base = "/brevo-template-sender";
      await put(base + "/triggers", { triggers: next });
      setTriggers(next);
      setModalContentType(null);
    } catch (e) {
      setTriggerSaveError(
        e?.message ?? "Erreur lors de l'enregistrement du template."
      );
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx(Flex, { justifyContent: "center", padding: 10, children: /* @__PURE__ */ jsx(Loader, {}) });
  }
  return /* @__PURE__ */ jsxs(Box, { padding: 10, children: [
    /* @__PURE__ */ jsx(Box, { paddingBottom: 6, children: /* @__PURE__ */ jsxs(Flex, { gap: 3, alignItems: "start", children: [
      /* @__PURE__ */ jsx(BrevoLogo, { style: { height: 32, width: "auto" }, "aria-hidden": true }),
      /* @__PURE__ */ jsx(Typography, { variant: "alpha", as: "h1", children: intl.formatMessage({
        id: "brevo-template-sender.config.title",
        defaultMessage: "HTML Sender configuration"
      }) })
    ] }) }),
    /* @__PURE__ */ jsx(Box, { paddingBottom: 8, children: /* @__PURE__ */ jsx(Typography, { variant: "epsilon", textColor: "neutral600", children: intl.formatMessage({
      id: "brevo-template-sender.config.description",
      defaultMessage: "Check the events (Create, Update, Delete, Publish, Unpublish) that should trigger an email. One template per content type: edit it via « Edit Template »."
    }) }) }),
    /* @__PURE__ */ jsxs(
      Box,
      {
        style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          marginBottom: 40
        },
        children: [
          /* @__PURE__ */ jsx(
            ConfigCard,
            {
              settings,
              setSettings,
              saving: savingSettings,
              onSave: saveSettings,
              message: settingsMessage,
              onDismissMessage: () => setSettingsMessage(null)
            }
          ),
          /* @__PURE__ */ jsx(
            ActiveTemplatesCard,
            {
              selectedContentTypes,
              hasTrigger,
              onManageContentTypes: () => setManageContentTypesModalOpen(true),
              onEditTemplate: (ct) => openModal(ct)
            }
          ),
          /* @__PURE__ */ jsx(
            SendEmailApiCard,
            {
              onConfigureTemplate: () => setDefaultTemplateModalOpen(true)
            }
          ),
          devSupport?.isDevelopment && /* @__PURE__ */ jsx(
            SupportPluginCard,
            {
              supportRepoUrl: devSupport.supportRepoUrl,
              bmcButtonImg
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      ManageContentTypesModal,
      {
        open: manageContentTypesModalOpen,
        onOpenChange: setManageContentTypesModalOpen,
        contentTypes,
        hasTrigger,
        toggleTrigger,
        getTemplateForContentType,
        onEditTemplate: (ct) => openModal(ct, true)
      }
    ),
    defaultTemplateModalOpen && /* @__PURE__ */ jsx(
      TemplateModal,
      {
        contentTypeUid: "",
        attributes: DEFAULT_SEND_EMAIL_ATTRIBUTES,
        displayName: intl.formatMessage({
          id: "brevo-template-sender.sendEmail.defaultTemplateName",
          defaultMessage: "Send Email API (default)"
        }),
        trigger: null,
        defaultTemplateCode: settings.sendEmailTemplateCode || "contact",
        openaiApiKeySet: settings.openaiApiKeySet,
        onClose: () => setDefaultTemplateModalOpen(false),
        onSave: () => {
        },
        onSaved: () => load()
      }
    ),
    modalContentType && /* @__PURE__ */ jsx(
      TemplateModal,
      {
        contentTypeUid: modalContentType.contentTypeUid,
        attributes: modalContentType.attributes,
        displayName: modalContentType.displayName,
        trigger: modalContentType.trigger,
        saveError: triggerSaveError,
        openaiApiKeySet: settings.openaiApiKeySet,
        onClose: () => {
          setModalContentType(null);
          setTriggerSaveError(null);
        },
        onDismissError: () => setTriggerSaveError(null),
        onSave: saveTrigger
      }
    )
  ] });
}
export {
  ConfigPage as default
};
