package edu.m2c2.hostapp

import android.annotation.SuppressLint
import android.content.Context
import android.net.Uri
import android.os.Bundle
import android.os.StrictMode
import android.os.StrictMode.VmPolicy
import android.util.Log
import android.webkit.*
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewClientCompat
import kotlinx.coroutines.Runnable


class MainActivity : AppCompatActivity() {
    private val tag = "HostApp"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val webView: WebView = findViewById(R.id.webView)
        webView.webViewClient = WebViewClient()
        webView.settings.apply {
            javaScriptEnabled = true
        }

//        StrictMode.setVmPolicy(
//            VmPolicy.Builder()
//                .detectLeakedSqlLiteObjects()
//                .detectLeakedClosableObjects()
//                .penaltyLog()
//                .penaltyDeath()
//                .build()
//        )
//
        try {
            Class.forName("dalvik.system.CloseGuard")
                .getMethod("setEnabled", Boolean::class.javaPrimitiveType)
                .invoke(null, true)
        } catch (e: ReflectiveOperationException) {
            throw java.lang.RuntimeException(e)
        }

        /** Instantiate the JavaScript WebView-to-native interop interface and set the context
         * This is how the native android app can
         * 1) receive data from the WebView
         * 2) know when the m2c2kit game and session is ended
         * The methods within this interface are directly called by the javascript code. Look
         * for these methods in the javascript code to understand how this works:
         *   Android.onActivityDataCreate(JSON.stringify(event)) or
         *   Android.onSessionLifecycleChange(JSON.stringify(event))
         * see https://developer.android.com/guide/webapps/webview#BindingJavaScript
         * */
        class M2c2Interface(private val mContext: Context) {

            @JavascriptInterface
            fun sessionManualStart(): Boolean {
                // if you want to control execution and custom game parameters, make sure
                // this returns true. Otherwise, the session will automatically start and
                // games will run with default parameters.
                return true;
            }

            lateinit var r: Runnable;

            @Throws(ReflectiveOperationException::class)
            @JavascriptInterface
            fun onSessionLifecycleChange(sessionLifecycleEventAsString: String) {
                Log.i(
                    tag,
                    "onSessionLifecycleChange callback from JavaScript received data: $sessionLifecycleEventAsString"
                )

                // the m2c2 session has just initialized; we can set our custom game parameters and start the session.
                // in our javascript code, we placed session on window, and thus we can control it from here with loadUrl()
                // (for type safety, we should deserialize this event string into an object, rather than try to parse the raw json string)
                if (sessionLifecycleEventAsString.contains("\"initialized\":true")) {

                    webView.post(Runnable {
                        // use setParameters to override the game's default parameters
                        // this is how we would take the parameters from a configuration json and insert them into the games
                        webView.loadUrl("javascript:window.session.options.activities[0].setParameters({ TrialNum: 2 });");
                        webView.loadUrl("javascript:window.session.start();");
                    })
                }
            }

            @JavascriptInterface
            fun onActivityDataCreate(activityDataEventAsString: String) {
                Log.i(
                    tag,
                    "onActivityDataCreate callback from JavaScript received data: $activityDataEventAsString"
                )
            }

            @JavascriptInterface
            fun onActivityLifecycleChange(activityLifecycleEventAsString: String) {
                Log.i(
                    tag,
                    "onActivityLifecycleChange callback from JavaScript received data: $activityLifecycleEventAsString"
                )
            }
        }

        webView.addJavascriptInterface(M2c2Interface(this), "Android")

        // see https://developer.android.com/guide/webapps/load-local-content for loading
        // webview content from app assets

        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()
        webView.webViewClient = LocalContentWebViewClient(assetLoader)
        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html")

    }

    private class LocalContentWebViewClient(private val assetLoader: WebViewAssetLoader) :
        WebViewClientCompat() {
        @RequiresApi(21)
        override fun shouldInterceptRequest(
            view: WebView,
            request: WebResourceRequest
        ): WebResourceResponse? {
            return assetLoader.shouldInterceptRequest(request.url)
        }

        // to support API < 21
        override fun shouldInterceptRequest(
            view: WebView,
            url: String
        ): WebResourceResponse? {
            return assetLoader.shouldInterceptRequest(Uri.parse(url))
        }
    }
}
