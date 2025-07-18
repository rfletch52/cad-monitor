#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>

// Audio imports for emergency alerts
#import <AVFoundation/AVFoundation.h>
#import <AudioToolbox/AudioToolbox.h>

// Push notification imports
#import <UserNotifications/UserNotifications.h>
#import <RNCPushNotificationIOS.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"WinnipegCADMonitor";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  // Configure audio session for emergency alerts
  [self configureAudioSession];
  
  // Configure push notifications
  [self configurePushNotifications:application];

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (void)configureAudioSession
{
  NSError *error = nil;
  AVAudioSession *audioSession = [AVAudioSession sharedInstance];
  
  // Set category to playback with options to bypass silent mode
  BOOL success = [audioSession setCategory:AVAudioSessionCategoryPlayback
                               withOptions:AVAudioSessionCategoryOptionMixWithOthers |
                                          AVAudioSessionCategoryOptionDuckOthers |
                                          AVAudioSessionCategoryOptionAllowBluetooth |
                                          AVAudioSessionCategoryOptionDefaultToSpeaker
                                     error:&error];
  
  if (!success) {
    NSLog(@"❌ Failed to set audio session category: %@", error.localizedDescription);
  } else {
    NSLog(@"✅ Audio session configured for emergency alerts");
  }
  
  // Activate the audio session
  success = [audioSession setActive:YES error:&error];
  if (!success) {
    NSLog(@"❌ Failed to activate audio session: %@", error.localizedDescription);
  } else {
    NSLog(@"✅ Audio session activated");
  }
}

- (void)configurePushNotifications:(UIApplication *)application
{
  // Define UNUserNotificationCenter
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;
  
  // Request permission for notifications
  [center requestAuthorizationWithOptions:(UNAuthorizationOptionAlert | UNAuthorizationOptionSound | UNAuthorizationOptionBadge)
                        completionHandler:^(BOOL granted, NSError * _Nullable error) {
    if (granted) {
      NSLog(@"✅ Push notification permission granted");
    } else {
      NSLog(@"❌ Push notification permission denied: %@", error.localizedDescription);
    }
  }];
  
  [application registerForRemoteNotifications];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// Linking API
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  return [RCTLinkingManager application:application openURL:url options:options];
}

// Universal Links
- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
  return [RCTLinkingManager application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
}

// Push Notifications
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  [RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  [RNCPushNotificationIOS didFailToRegisterForRemoteNotificationsWithError:error];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

// Local Notifications
- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler
{
  [RNCPushNotificationIOS didReceiveNotificationResponse:response];
  completionHandler();
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  // Show notification even when app is in foreground
  completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge);
}

@end