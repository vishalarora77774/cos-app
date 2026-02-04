import Expo
import React
import ReactAppDependencyProvider

@UIApplicationMain
public class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ExpoReactNativeFactoryDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    bindReactNativeFactory(factory)

#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  // Linking API
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }

  // Universal Links
  public override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    let result = RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    return super.application(application, continue: userActivity, restorationHandler: restorationHandler) || result
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  // Extension point for config-plugins

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    // needed to return the correct URL for expo-dev-client.
    bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    // Try to get bundle URL from Metro
    let bundleURLProvider = RCTBundleURLProvider.sharedSettings()
    
    // Enable live reload and allow arbitrary loads for development
    bundleURLProvider.jsLocation = nil // Auto-detect
    
    // Try to get the bundle URL (this should auto-detect the correct IP)
    if let url = bundleURLProvider.jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry") {
      print("✅ Found Metro bundle URL: \(url.absoluteString)")
      return url
    }
    
    // Fallback: Try to construct URL manually if Metro is running
    // Get the local IP address from environment variable or use common development IP
    if let localIP = ProcessInfo.processInfo.environment["EXPO_DEV_CLIENT_LOCAL_IP"] {
      let urlString = "http://\(localIP):8081/.expo/.virtual-metro-entry"
      if let url = URL(string: urlString) {
        print("✅ Using manual bundle URL from env: \(url.absoluteString)")
        return url
      }
    }
    
    // Try to get IP from Metro's default detection
    // RCTBundleURLProvider should handle this, but if not, we'll use localhost for simulator
    #if targetEnvironment(simulator)
      // Simulator can use localhost
      if let url = URL(string: "http://localhost:8081/.expo/.virtual-metro-entry") {
        print("✅ Using localhost for simulator: \(url.absoluteString)")
        return url
      }
    #else
      // Real device - need to use computer's IP
      // This will be set via Xcode scheme environment variable
      print("⚠️ Real device detected - ensure EXPO_DEV_CLIENT_LOCAL_IP is set in Xcode scheme")
      // Return nil to let the dev menu handle connection
      return nil
    #endif
    
    print("❌ Could not determine bundle URL")
    return nil
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
