import UIKit
import WebKit

final class QimingWebViewController: UIViewController, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
    private static let localScheme = "qiming-app"
    private let schemeHandler = QimingSchemeHandler()
    private var webView: WKWebView!

    override var preferredStatusBarStyle: UIStatusBarStyle {
        .darkContent
    }

    override func loadView() {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        configuration.applicationNameForUserAgent = "Html5Plus QimingNative iOS"
        configuration.setURLSchemeHandler(schemeHandler, forURLScheme: Self.localScheme)
        configuration.userContentController.add(self, name: "qimingNative")
        configuration.userContentController.addUserScript(
            WKUserScript(
                source: Self.nativeBootstrapScript,
                injectionTime: .atDocumentStart,
                forMainFrameOnly: true
            )
        )
        configuration.userContentController.addUserScript(
            WKUserScript(
                source: Self.diagnosticsScript,
                injectionTime: .atDocumentStart,
                forMainFrameOnly: false
            )
        )

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 0.97, green: 0.98, blue: 0.99, alpha: 1)
        webView.scrollView.backgroundColor = webView.backgroundColor
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.bounces = false
        webView.allowsBackForwardNavigationGestures = true
        self.webView = webView
        view = webView
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        loadOfflineBundle(entry: LaunchOptions(arguments: ProcessInfo.processInfo.arguments).entry)
    }

    override func viewSafeAreaInsetsDidChange() {
        super.viewSafeAreaInsetsDidChange()
        applyNativeSafeArea()
    }

    deinit {
        webView?.configuration.userContentController.removeScriptMessageHandler(forName: "qimingNative")
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        NSLog("[QimingNative] %@", String(describing: message.body))
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        applyNativeSafeArea()
    }

    func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationAction: WKNavigationAction,
        decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
    ) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.cancel)
            return
        }

        if navigationAction.targetFrame == nil, isWebUrl(url) {
            webView.load(URLRequest(url: url))
            decisionHandler(.cancel)
            return
        }

        if isWebUrl(url) || url.scheme == "about" || url.scheme == "blob" || url.scheme == "data" {
            decisionHandler(.allow)
            return
        }

        if UIApplication.shared.canOpenURL(url) {
            UIApplication.shared.open(url)
        }
        decisionHandler(.cancel)
    }

    @available(iOS 15.0, *)
    func webView(
        _ webView: WKWebView,
        requestMediaCapturePermissionFor origin: WKSecurityOrigin,
        initiatedByFrame frame: WKFrameInfo,
        type: WKMediaCaptureType,
        decisionHandler: @escaping (WKPermissionDecision) -> Void
    ) {
        decisionHandler(.prompt)
    }

    private func isWebUrl(_ url: URL) -> Bool {
        guard let scheme = url.scheme?.lowercased() else { return false }
        return [Self.localScheme, "http", "https"].contains(scheme)
    }

    private func loadOfflineBundle(entry: String) {
        guard Bundle.main.url(
            forResource: "index",
            withExtension: "html",
            subdirectory: "AppResources"
        ) != nil else {
            showLoadFailure("Offline bundle is missing. Run pnpm native:prepare first.")
            return
        }

        let safeEntry = normalize(entry: entry)
        let statusTop = currentSafeArea().top
        let separator = safeEntry.contains("?") ? "&" : "?"
        let fragment = "\(safeEntry)\(separator)qimingNative=1&nativeStatusTop=\(statusTop)"
        guard let url = URL(string: "\(Self.localScheme)://app/index.html#\(fragment)") else {
            showLoadFailure("The native start route is invalid.")
            return
        }
        webView.load(URLRequest(url: url))
    }

    private func normalize(entry: String) -> String {
        var output = entry.trimmingCharacters(in: .whitespacesAndNewlines)
        if output.isEmpty { output = "/login" }
        if output.hasPrefix("#") { output.removeFirst() }
        if !output.hasPrefix("/") { output = "/" + output }
        if output.hasPrefix("//") || output.contains("://") { return "/login" }
        return output
    }

    private func currentSafeArea() -> (top: Int, bottom: Int) {
        let windowInsets = view.window?.safeAreaInsets ?? .zero
        let top = max(view.safeAreaInsets.top, windowInsets.top)
        let bottom = max(view.safeAreaInsets.bottom, windowInsets.bottom)
        return (Int(top.rounded(.up)), Int(bottom.rounded(.up)))
    }

    private func applyNativeSafeArea() {
        guard isViewLoaded else { return }
        let safeArea = currentSafeArea()
        let script = """
        (function () {
          var root = document.documentElement;
          root.classList.add('qiming-native-webview', 'qiming-native-ios');
          root.setAttribute('data-qiming-native', 'true');
          root.style.setProperty('--qiming-native-safe-top', '\(safeArea.top)px', 'important');
          root.style.setProperty('--qiming-native-status-top', '\(safeArea.top)px', 'important');
          root.style.setProperty('--qiming-native-safe-bottom', '\(safeArea.bottom)px', 'important');
          root.style.setProperty('--pure-safe-area-top', '\(safeArea.top)px', 'important');
          root.style.setProperty('--pure-safe-area-bottom', '\(safeArea.bottom)px', 'important');
        })();
        """
        webView.evaluateJavaScript(script, completionHandler: nil)
    }

    private func showLoadFailure(_ message: String) {
        let label = UILabel()
        label.numberOfLines = 0
        label.textAlignment = .center
        label.font = .systemFont(ofSize: 15, weight: .medium)
        label.textColor = UIColor(red: 0.18, green: 0.22, blue: 0.31, alpha: 1)
        label.text = "IntellEdu failed to load.\n\n\(message)"
        label.translatesAutoresizingMaskIntoConstraints = false

        let container = UIView()
        container.backgroundColor = UIColor(red: 0.97, green: 0.98, blue: 0.99, alpha: 1)
        container.addSubview(label)
        NSLayoutConstraint.activate([
            label.leadingAnchor.constraint(equalTo: container.leadingAnchor, constant: 28),
            label.trailingAnchor.constraint(equalTo: container.trailingAnchor, constant: -28),
            label.centerYAnchor.constraint(equalTo: container.centerYAnchor)
        ])
        view = container
    }
}

private extension QimingWebViewController {
    static let nativeBootstrapScript = """
    (function () {
      var root = document.documentElement;
      root.classList.add('qiming-native-webview', 'qiming-native-ios');
      root.setAttribute('data-qiming-native', 'true');
      root.style.setProperty('--qiming-native-safe-top', 'env(safe-area-inset-top, 0px)');
      root.style.setProperty('--qiming-native-safe-bottom', 'env(safe-area-inset-bottom, 0px)');
      root.style.setProperty('--pure-safe-area-top', 'env(safe-area-inset-top, 0px)');
      root.style.setProperty('--pure-safe-area-bottom', 'env(safe-area-inset-bottom, 0px)');
    })();
    """

    static let diagnosticsScript = """
    (function () {
      if (window.__qimingIosDiagnosticsInstalled) return;
      window.__qimingIosDiagnosticsInstalled = true;
      function post(type, payload) {
        try {
          window.webkit.messageHandlers.qimingNative.postMessage({
            type: type,
            payload: String(payload || '').slice(0, 1600),
            href: location.href,
            timestamp: Date.now()
          });
        } catch (_) {}
      }
      window.addEventListener('error', function (event) {
        post('error', event.message || (event.target && (event.target.src || event.target.href)));
      }, true);
      window.addEventListener('unhandledrejection', function (event) {
        post('unhandledrejection', event.reason && (event.reason.stack || event.reason.message || event.reason));
      });
    })();
    """
}

private final class QimingSchemeHandler: NSObject, WKURLSchemeHandler {
    private let resourceDirectory: URL

    override init() {
        resourceDirectory = Bundle.main.resourceURL?
            .appendingPathComponent("AppResources", isDirectory: true)
            .standardizedFileURL
            ?? URL(fileURLWithPath: "/")
        super.init()
    }

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let requestUrl = urlSchemeTask.request.url,
              let fileUrl = fileUrl(for: requestUrl) else {
            urlSchemeTask.didFailWithError(NSError(domain: NSURLErrorDomain, code: NSURLErrorFileDoesNotExist))
            return
        }

        do {
            let data = try Data(contentsOf: fileUrl, options: .mappedIfSafe)
            let response = URLResponse(
                url: requestUrl,
                mimeType: mimeType(for: fileUrl.pathExtension),
                expectedContentLength: data.count,
                textEncodingName: textEncoding(for: fileUrl.pathExtension)
            )
            urlSchemeTask.didReceive(response)
            urlSchemeTask.didReceive(data)
            urlSchemeTask.didFinish()
        } catch {
            urlSchemeTask.didFailWithError(error)
        }
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {}

    private func fileUrl(for url: URL) -> URL? {
        let decoded = url.path.removingPercentEncoding ?? url.path
        var relativePath = decoded.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        if relativePath.isEmpty { relativePath = "index.html" }
        guard !relativePath.split(separator: "/").contains("..") else { return nil }

        var candidate = resourceDirectory
            .appendingPathComponent(relativePath, isDirectory: false)
            .standardizedFileURL
        let rootPath = resourceDirectory.path
        guard candidate.path == rootPath || candidate.path.hasPrefix(rootPath + "/") else { return nil }

        var isDirectory: ObjCBool = false
        guard FileManager.default.fileExists(atPath: candidate.path, isDirectory: &isDirectory) else { return nil }
        if isDirectory.boolValue {
            candidate.appendPathComponent("index.html", isDirectory: false)
        }
        return candidate
    }

    private func mimeType(for fileExtension: String) -> String {
        switch fileExtension.lowercased() {
        case "html", "htm": return "text/html"
        case "js", "mjs": return "text/javascript"
        case "css": return "text/css"
        case "json", "webmanifest", "map": return "application/json"
        case "wasm": return "application/wasm"
        case "svg": return "image/svg+xml"
        case "png": return "image/png"
        case "jpg", "jpeg": return "image/jpeg"
        case "gif": return "image/gif"
        case "webp": return "image/webp"
        case "ico": return "image/x-icon"
        case "mp4": return "video/mp4"
        case "webm": return "video/webm"
        case "mp3": return "audio/mpeg"
        case "wav": return "audio/wav"
        case "pdf": return "application/pdf"
        case "ttf": return "font/ttf"
        case "otf": return "font/otf"
        case "woff": return "font/woff"
        case "woff2": return "font/woff2"
        default: return "application/octet-stream"
        }
    }

    private func textEncoding(for fileExtension: String) -> String? {
        switch fileExtension.lowercased() {
        case "html", "htm", "js", "mjs", "css", "json", "webmanifest", "svg", "txt":
            return "utf-8"
        default:
            return nil
        }
    }
}

private struct LaunchOptions {
    let entry: String

    init(arguments: [String]) {
        var entry = ProcessInfo.processInfo.environment["QIMING_ENTRY"] ?? "/login"
        var index = 0
        while index < arguments.count {
            let value = arguments[index]
            if (value == "--entry" || value == "-entry"), index + 1 < arguments.count {
                entry = arguments[index + 1]
                index += 2
                continue
            }
            index += 1
        }
        self.entry = entry
    }
}
