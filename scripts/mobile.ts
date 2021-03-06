/// <reference path="../libs/xt.d.ts" />
declare var pako: any

class MobileDebugger {

    start() {
        if (window.location.search.indexOf('?ws://') === 0) {
            const wsServices = decodeURIComponent(window.location.search.substring(1)).split("|||")
            let found = false
            wsServices.filter(it => it.trim().length > 0 && it.indexOf("ws://") >= 0).forEach(wsServer => {
                const wsHostname = wsServer.substring(5).split(':')[0]
                const wsPort = parseInt(wsServer.substring(5).split(':')[1]);
                const xmlRequest = new XMLHttpRequest();
                xmlRequest.timeout = 5000;
                xmlRequest.open("GET", "http://" + wsHostname + ":" + (wsPort + 1) + "/status", true);
                xmlRequest.onloadend = () => {
                    if (found === true) { return }
                    if (xmlRequest.responseText === "continue") {
                        found = true;
                        (XT.Debug as any).worker = new Worker('libs/Core/xt.debugWorker.web.min.js');
                        (XT.Debug as any).connect(wsHostname, wsPort);
                        (XT.Debug as any).reloadHandler = function (source, force) {
                            if (force === true) {
                                window.location.reload()
                            }
                            else {
                                const url = URL.createObjectURL(new Blob([source], { type: "text/plain" }))
                                const context: any = UI.Context.startWithURL(url, {}, () => {
                                    context.attachTo()
                                }, (e) => { alert(e.message) })
                            }
                        }
                    }
                }
                xmlRequest.send();
            })
        }
        else if (window.location.search.indexOf('?eval=') === 0) {
            const base64Encoded = window.location.search.substring(6).split("&")[0]
            const source = decodeURIComponent(escape(String.fromCharCode.apply(null, pako.inflate(atob(base64Encoded)))))
            const url = URL.createObjectURL(new Blob([source], { type: "text/plain" }))
            const context: any = UI.Context.startWithURL(url, {}, () => {
                context.attachTo()
            }, (e) => { alert(e.message) })

        }
        else if (window.location.search.indexOf('?url=') === 0) {
            const downloadRequest = new XMLHttpRequest()
            downloadRequest.onloadend = () => {
                const source = downloadRequest.responseText;
                const url = URL.createObjectURL(new Blob([source], { type: "text/plain" }))
                const context: any = UI.Context.startWithURL(url, {}, () => {
                    context.attachTo()
                }, (e) => { alert(e.message) })
            }
            downloadRequest.open("GET", atob(window.location.search.substring(5).split("&")[0]), true)
            downloadRequest.send()
        }
    }

}

var mobileDebugger = new MobileDebugger()
mobileDebugger.start()