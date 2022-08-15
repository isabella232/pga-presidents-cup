/* eslint-disable */
/*
 * Copyright (c) 2016 Omnigon Communications, LLC. All rights reserved.
 *
 * This software is the confidential and proprietary information of Omnigon Communications, LLC
 * ("Confidential Information"). You shall not disclose such Confidential Information and shall access and use it only
 * in accordance with the terms of the license agreement you entered into with Omnigon Communications, LLC, its
 * subsidiaries, affiliates or authorized licensee. Unless required by applicable law or agreed to in writing, this
 * Confidential Information is provided on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the license agreement for the specific language governing permissions and limitations.
 */


(function ($, global, pgatour) {
  var AdGroup = pgatour.AdGroup = pgatour.AdGroup || pgatour.Base.extend({

      ads: null,

      constructor: function () {
          this.ads = [];
      },

      addAd: function (ad) {
          if (pgatour.getItemIndex(this.ads, ad) !== -1) {
              return;
          }
          this.ads.push(ad);
      },

      removeAd: function (id) {
          this.ads = this.ads.filter(this.proxy(this.filterAd, id));
      },

      filterAd: function (id, ad) {
          return ad.id !== id;
      },

      isAdVisible: function () {
          for (var i = 0, ii = this.ads.length; i < ii; i++) {
              var ad = this.ads[i];
              if (ad.isAdVisible()) {
                  return true;
              }
          }
          return false;
      },

      updateAds: function (automatic, reason, noInvalidate, noRefresh) {
          for (var i = 0, ii = this.ads.length; i < ii; i++) {
              var ad = this.ads[i];
              ad.updateAd(automatic, reason, noInvalidate, noRefresh);
          }
      },

      suspendAds: function () {
          for (var i = 0, ii = this.ads.length; i < ii; i++) {
              var ad = this.ads[i];
              ad.suspendCurrentAd();
          }
      }

  }, {

      groups: {},

      init: function () {
          //override this function
      },

      registerAd: function (ad, groupId) {
          groupId = groupId || pgatour.generateId('ad-group');
          var group = this.groups[groupId];
          if (!group) {
              group = this.groups[groupId] = new AdGroup();
          }
          group.addAd(ad);
          return group;
      }

  });
})(jQuery, window, pgatour);

/*
* Copyright (c) 2016 Omnigon Communications, LLC. All rights reserved.
*
* This software is the confidential and proprietary information of Omnigon Communications, LLC
* ("Confidential Information"). You shall not disclose such Confidential Information and shall access and use it only
* in accordance with the terms of the license agreement you entered into with Omnigon Communications, LLC, its
* subsidiaries, affiliates or authorized licensee. Unless required by applicable law or agreed to in writing, this
* Confidential Information is provided on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
* express or implied. See the license agreement for the specific language governing permissions and limitations.
*/
(function ($, global, pgatour) {
  global.digitalData = global.digitalData || {};
  if(!global.digitalData.webperformance) {
      global.digitalData.webperformance = {};
  }
  pgatour.WebPerformanceTracker = {
      pages: {
          HOME: 'homepage',
          LEADERBOARD: 'leaderboard'
      },
      adPositions: {
          ROW5: 'row5',
          TOPRIGHT: 'topright',
          TOP: 'top'
      },
      newrelicEvents: {
          AD_SLOT_PROVISION_EVENT_LABEL: 'Ad Slot Provision',
          AD_REQUEST_ROW5: 'LB - Ad Call Row 5',
          AD_IMPRESSION_ROW5: 'LB - Ad Impression Row 5',
          LB_AD_REQUEST_TOPRIGHT: 'LB - Ad Call Top Right',
          LB_AD_IMPRESSION_TOPRIGHT: 'LB - Ad Impression Top Right',
          T1_TITLE: 'HP - T1 Title',
          T1_IMAGE: 'HP - T1 Image',
          LB_PLAYER_ROW: 'LB - Player Row',
          HOME_AD_REQUEST_TOP: 'HP - Ad Call Top',
          HOME_AD_IMPRESSION_TOP: 'HP - Ad Impression Top',
          FIRST_SCROLL: 'User 1st Scroll',
          LB_PAGE_TITLE: 'LB - Page Title',
          NAV_BG_RENDER: 'Render Nav BG',
          HEADER_AUCTION_INDEX: 'Header Auction Index',
          FIRST_PARTY_DMP: '1st Party DMP'
      },
      satelliteEvents: {
          AD_SLOT_PROVISION_EVENT_LABEL: 'ad-slot-provision',
          AD_REQUEST_ROW5: 'leaderboard-ad-call-row5',
          AD_IMPRESSION_ROW5: 'leaderboard-ad-impression-row5',
          LB_AD_REQUEST_TOPRIGHT: 'leaderboard-ad-call-topright',
          LB_AD_IMPRESSION_TOPRIGHT: 'leaderboard-ad-impression-topright',
          T1_TITLE: 'homepage-t1-title',
          T1_IMAGE: 'homepage-t1-image',
          LB_PLAYER_ROW: 'leaderboard-player-row',
          HOME_AD_REQUEST_TOP: 'homepage-ad-call-top',
          HOME_AD_IMPRESSION_TOP: 'homepage-ad-impression-top',
          FIRST_SCROLL: 'first-scroll',
          LB_PAGE_TITLE: 'leaderboard-page-title',
          NAV_BG_RENDER: 'nav-bg-render',
          HEADER_AUCTION_INDEX: 'header-auction-index',
          BACKEND_DURATION: 'backend-duration',
          DOM_PROCESSING_DURATION: 'dom-duration',
          PAGE_RENDER_DURATION: 'render-duration',
          PAGE_LOAD_DURATION: 'load-duration',
          FIRST_PARTY_DMP: '1st-party-dmp'
      },
      digitalData: {
          AD_SLOT_PROVISION: 'ad-provision',
          AD_REQUEST_ROW5: 'lb-row5-call',
          AD_IMPRESSION_ROW5: 'lb-row5-impression',
          LB_AD_REQUEST_TOPRIGHT: 'toprightcall',
          LB_AD_IMPRESSION_TOPRIGHT: 'toprightimp',
          T1_TITLE: 't1-title',
          T1_IMAGE: 't1-image',
          LB_PLAYER_ROW: 'player-row',
          HOME_AD_REQUEST_TOP: 'topcall',
          HOME_AD_IMPRESSION_TOP: 'topimp',
          FIRST_SCROLL: 'firstscroll',
          LB_PAGE_TITLE: 'lbtitle',
          NAV_BG_RENDER: 'navbg',
          HEADER_AUCTION_INDEX: 'auctionindex',
          BACKEND_DURATION: 'backend',
          DOM_PROCESSING_DURATION: 'dom',
          PAGE_RENDER_DURATION: 'render',
          PAGE_LOAD_DURATION: 'totalload',
          FIRST_PARTY_DMP: '1stpartydmp'
      },
      eventsQueue: [],

      constructEventTime: function (startTime, endTime) {
          var timeInSeconds = (endTime - startTime) / 1000;
          return this.toFixedNumber(timeInSeconds, 2);
      },

      toFixedNumber: function (value, numberOfDigits) {
          numberOfDigits = numberOfDigits || 2;
          var pow = Math.pow(10, numberOfDigits);
          return +(Math.round(value * pow) / pow);
      },

      getAdPosition: function (ad) {
          return ad.options.pos;
      },

      getDigitalDataProperty: function (property) {
          return global.digitalData.webperformance[property];
      },

      isNavigationTimingAvailable: function () {
          return global.performance !== undefined && global.performance.timing !== undefined && global.performance.timing.navigationStart > 0;
      },

      isLeaderboardPage: function (adOptions) {
          adOptions = adOptions || {};
          return adOptions.s4 === this.pages.LEADERBOARD || adOptions.s2 === this.pages.LEADERBOARD;
      },

      isHomepage: function (adOptions) {
          adOptions = adOptions || {};
          return adOptions.s2 === this.pages.HOME;
      },

      trackGptScriptLoad: function () {
          this.track(
              this.newrelicEvents.AD_SLOT_PROVISION_EVENT_LABEL,
              this.satelliteEvents.AD_SLOT_PROVISION_EVENT_LABEL,
              this.digitalData.AD_SLOT_PROVISION
          );
      },

      trackAdRow5Render: function () {
          this.track(
              this.newrelicEvents.AD_IMPRESSION_ROW5,
              this.satelliteEvents.AD_IMPRESSION_ROW5,
              this.digitalData.AD_IMPRESSION_ROW5
          );
      },

      trackAdRow5Request: function () {
          this.track(
              this.newrelicEvents.AD_REQUEST_ROW5,
              this.satelliteEvents.AD_REQUEST_ROW5,
              this.digitalData.AD_REQUEST_ROW5
          );
      },

      trackLeaderboardPageTitleRendered: function () {
          this.track(
              this.newrelicEvents.LB_PAGE_TITLE,
              this.satelliteEvents.LB_PAGE_TITLE,
              this.digitalData.LB_PAGE_TITLE
          );
      },

      trackLeaderboardAdToprightRequest: function () {
          this.track(
              this.newrelicEvents.LB_AD_REQUEST_TOPRIGHT,
              this.satelliteEvents.LB_AD_REQUEST_TOPRIGHT,
              this.digitalData.LB_AD_REQUEST_TOPRIGHT
          );
      },

      trackLeaderboardAdToprightRender: function () {
          this.track(
              this.newrelicEvents.LB_AD_IMPRESSION_TOPRIGHT,
              this.satelliteEvents.LB_AD_IMPRESSION_TOPRIGHT,
              this.digitalData.LB_AD_IMPRESSION_TOPRIGHT
          );
      },

      trackHomepageAdTopRequest: function () {
          this.track(
              this.newrelicEvents.HOME_AD_REQUEST_TOP,
              this.satelliteEvents.HOME_AD_REQUEST_TOP,
              this.digitalData.HOME_AD_REQUEST_TOP
          );
      },

      trackHomepageAdTopRender: function () {
          this.track(
              this.newrelicEvents.HOME_AD_IMPRESSION_TOP,
              this.satelliteEvents.HOME_AD_IMPRESSION_TOP,
              this.digitalData.HOME_AD_IMPRESSION_TOP
          );
      },

      trackFirstT1TitleRendered: function () {
          this.track(
              this.newrelicEvents.T1_TITLE,
              this.satelliteEvents.T1_TITLE,
              this.digitalData.T1_TITLE
          );
      },

      trackFirstT1ImageRendered: function () {
          this.track(
              this.newrelicEvents.T1_IMAGE,
              this.satelliteEvents.T1_IMAGE,
              this.digitalData.T1_IMAGE
          );
      },

      trackFirstPlayerRendered: function () {
          this.track(
              this.newrelicEvents.LB_PLAYER_ROW,
              this.satelliteEvents.LB_PLAYER_ROW,
              this.digitalData.LB_PLAYER_ROW
          );
      },

      trackNavBackgroundRender: function () {
          this.track(
              this.newrelicEvents.NAV_BG_RENDER,
              this.satelliteEvents.NAV_BG_RENDER,
              this.digitalData.NAV_BG_RENDER
          );
      },

      track: function (newrelicEventLabel, satelliteEventLabel, digitalData, responseTime) {
          if(!this.isNavigationTimingAvailable()) {
              return;
          }
          if(this.eventsQueue.length) {
              this.trackQueuedEvents();
          }
          var now = Date.now();
          responseTime = responseTime || this.constructEventTime(global.performance.timing.navigationStart, now);
          global.digitalData.webperformance[digitalData] = responseTime;
          this.addNewrelicPageAction(newrelicEventLabel, responseTime);
          global._satellite && global._satellite.track(satelliteEventLabel);
      },

      trackFirstAdShow: function (ad, adOptions) {
          var adPosition = this.getAdPosition(ad);
          switch(adPosition) {
              case this.adPositions.TOPRIGHT: {
                  if(this.isLeaderboardPage(adOptions) && !pgatour.is.mobile) {
                      this.trackLeaderboardAdToprightRender();
                  }
                  break;
              }
              case this.adPositions.ROW5: {
                  this.trackAdRow5Render();
                  break;
              }
              case this.adPositions.TOP: {
                  if(this.isHomepage(adOptions)) {
                      this.trackHomepageAdTopRender();
                  }
                  break;
              }
              default:
          }
      },

      trackFirstAdRequests: function (ads, adOptions) {
          ads = ads || [];
          var ad,
              i;
          for (i = 0; i < ads.length; i++) {
              ad = ads[i];
              if(ad.isFirstShow) {
                  this.trackSingleFirstAdRequest(ad, adOptions);
              }
          }
      },

      trackSingleFirstAdRequest: function (ad, adOptions) {
          var adPosition = this.getAdPosition(ad);
          switch(adPosition) {
              case this.adPositions.TOPRIGHT: {
                  if(this.isLeaderboardPage(adOptions) && !pgatour.is.mobile) {
                      this.trackLeaderboardAdToprightRequest();
                  }
                  break;
              }
              case this.adPositions.ROW5: {
                  this.trackAdRow5Request();
                  break;
              }
              case this.adPositions.TOP: {
                  if(this.isHomepage(adOptions)) {
                      this.trackHomepageAdTopRequest();
                  }
                  break;
              }
              default:
          }
      },

      trackFirstScrollEvent: function () {
          var isScrollTracked = this.getDigitalDataProperty(this.digitalData.FIRST_SCROLL);
          if(isScrollTracked) {
              return;
          }
          this.track(
              this.newrelicEvents.FIRST_SCROLL,
              this.satelliteEvents.FIRST_SCROLL,
              this.digitalData.FIRST_SCROLL
          );
      },

      trackAuctionIndex: function () {
          var event = this.createQueuedEventObject(
              this.newrelicEvents.HEADER_AUCTION_INDEX,
              this.satelliteEvents.HEADER_AUCTION_INDEX,
              this.digitalData.HEADER_AUCTION_INDEX
          );
          this.addEventToQueue(event);
      },

      trackFirstPartyDMP: function () {
          var event = this.createQueuedEventObject(
              this.newrelicEvents.FIRST_PARTY_DMP,
              this.satelliteEvents.FIRST_PARTY_DMP,
              this.digitalData.FIRST_PARTY_DMP
          );
          this.addEventToQueue(event);
      },

      trackQueuedEvents: function () {
          var event;
          while (this.eventsQueue.length) {
              event = this.eventsQueue.shift();
              this.track(event.newrelic, event.satellite, event.digitalData, event.time);
          }
      },

      trackBackendDuration: function () {
          var perfTiming = global.performance.timing,
              time = this.constructEventTime(perfTiming.navigationStart, perfTiming.responseStart);
          this.sendDefaultNREventsToOmniture(this.satelliteEvents.BACKEND_DURATION, this.digitalData.BACKEND_DURATION, time);
      },

      trackDOMProcessingDuration: function () {
          var perfTiming = global.performance.timing,
              time = this.constructEventTime(perfTiming.responseStart, perfTiming.domContentLoadedEventEnd);
          this.sendDefaultNREventsToOmniture(this.satelliteEvents.DOM_PROCESSING_DURATION, this.digitalData.DOM_PROCESSING_DURATION, time);
      },

      trackPageRenderDuration: function () {
          var perfTiming = global.performance.timing,
              time = this.constructEventTime(perfTiming.domContentLoadedEventEnd, perfTiming.loadEventEnd);
          this.sendDefaultNREventsToOmniture(this.satelliteEvents.PAGE_RENDER_DURATION, this.digitalData.PAGE_RENDER_DURATION, time);
      },

      trackPageLoadDuration: function () {
          var perfTiming = global.performance.timing,
              time = this.constructEventTime(perfTiming.navigationStart, perfTiming.loadEventEnd);
          this.sendDefaultNREventsToOmniture(this.satelliteEvents.PAGE_LOAD_DURATION, this.digitalData.PAGE_LOAD_DURATION, time);
      },

      sendDefaultNREventsToOmniture: function (satelliteEventLabel, digitalData, timestamp) {
          global.digitalData.webperformance[digitalData] = timestamp;
          global._satellite && global._satellite.track(satelliteEventLabel);
      },

      trackDefaultNREventsForOmniture: function () {
          if(!this.isNavigationTimingAvailable()) {
              return;
          }
          this.trackBackendDuration();
          this.trackDOMProcessingDuration();
          this.trackPageRenderDuration();
          this.trackPageLoadDuration();
      },

      addNewrelicPageAction: function (eventName, responseTime) {
          if (!global.newrelic) {
              return;
          }
          global.newrelic.setCustomAttribute(eventName, responseTime);
          global.newrelic.addPageAction(eventName + ' - action');
      },

      addEventToQueue: function (event) {
          this.eventsQueue.push(event);
      },

      createQueuedEventObject: function (newrelicEvent, satelliteEvent, digitalData) {
          return {
              newrelic: newrelicEvent,
              satellite: satelliteEvent,
              digitalData: digitalData,
              time: this.constructEventTime(global.performance.timing.navigationStart, Date.now())
          };
      }

  };
})(jQuery, window, pgatour);

/*
* Copyright (c) 2016 Omnigon Communications, LLC. All rights reserved.
*
* This software is the confidential and proprietary information of Omnigon Communications, LLC
* ("Confidential Information"). You shall not disclose such Confidential Information and shall access and use it only
* in accordance with the terms of the license agreement you entered into with Omnigon Communications, LLC, its
* subsidiaries, affiliates or authorized licensee. Unless required by applicable law or agreed to in writing, this
* Confidential Information is provided on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
* express or implied. See the license agreement for the specific language governing permissions and limitations.
*/

(function ($, global, pgatour) {
  var GDPR_COUNTRIES = ['AT', 'BE', 'BG', 'CZ', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'EL', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];

  pgatour.AdUtils = {
      gptScriptUrl: '//www.googletagservices.com/tag/js/gpt.js',
      enableSingleRequest: true,
      refreshUnfilledSlots: true,
      adClass: 'js-ad',
      slotNamePattern: '/{networkCode}/{site}.{device}/{s1}/{s2}/{s3}/{s4}',
      networkCode: '9517547',
      site: '',
      options: {},
      justInTime: false,
      justOnScroll: false,
      refreshInterval: 0,
      refreshOnResize: false,
      refreshOnScroll: false,
      refreshOnActivity: true,
      separatedRequest: false,
      trackBrowserActivity: true,
      useEngageTime: false,
      refreshDisabled: false,
      allAdsSuspended: false,
      visibilityPercentage: 20,
      viewportMargins: undefined,

      storeOnDom: true,
      loaded: false,
      initialized: false,
      creationCallbacks: [],
      ads: {},
      adsToRefresh: [],
      separatedAdsToRefresh: [],
      flushingAds: false,
      flushDelay: 1000,
      flushComplete: 0,
      flushTotal: 0,

      adsPrivacy: 1,

      init: function () {
          this.loadGptScript();
          var siteUrl = global.document.location.pathname.substr(1).replace(/[\/.]/g, '_');
          var adTest = pgatour.getUrlParam('ad_test');
          this.initPrivacy();
          this.stackCommand(function () {
              googletag.pubads().setTargeting('url_path', siteUrl);
              if (adTest) {
                  googletag.pubads().setTargeting('ad_test', adTest);
              }
          });
          pgatour.EngageTimer.setEngageCallback(this.proxy(this.onEngageTimer));
      },

      initPrivacy: function () {
          var userCountry = $.cookie('PGAT_Country');
          this.requireGDPR = GDPR_COUNTRIES.indexOf(userCountry) !== -1;
          this.requireCCPA = userCountry === 'US';
          if (this.requireCCPA) {
              this.adsPrivacy = 0;
          }
      },

      /*
       * Options for the config object in Ad.setup(config):
       * adClass: String (optional). Default to "js-ad"
       * networkCode: String
       * site: String
       * options: Object
       * justInTime: Boolean (optional). Default is "true"
       * justOnScroll: Boolean (optional). Default is "false"
       * refreshInterval: Number (optional). In sec. Default is "0"
       * refreshOnResize: Boolean (optional). Default is "false"
       * refreshOnScroll: Boolean (optional). Default is "false"
       * refreshOnActivity: Boolean (optional). Default is "true"
       * trackBrowserActivity: Boolean (optional) Default is "true"
       * enableSingleRequest: Boolean (optional). Default is "true"
       * useEngageTime: Boolean (optional). Default to "false"
       * separatedRequest: Boolean (optional). Default to "false"
       * refreshDisabled: Boolean (optional). Default to "false"
       * visibilityPercentage: Number/Boolean (optional). Default to "20"
       * refreshUnfilledSlots: Boolean (optional). Default is "true"
       * storeOnDom: Boolean (optional). Default to "true"
       * slotNamePattern: String (optional)
       */
      setup: function (config) {
          this.adClass = config.adClass || this.adClass;
          this.networkCode = config.networkCode || this.networkCode;
          this.site = config.site || this.site;
          this.options = $.extend(this.options, config.options);
          this.enableSingleRequest = this.getConfigValue(config.enableSingleRequest, this.enableSingleRequest);
          this.refreshUnfilledSlots = this.getConfigValue(config.refreshUnfilledSlots, this.refreshUnfilledSlots);
          this.justInTime = this.getConfigValue(config.justInTime, this.justInTime);
          this.justOnScroll = this.getConfigValue(config.justOnScroll, this.justOnScroll);
          this.refreshInterval = this.getConfigValue(config.refreshInterval, this.refreshInterval);
          this.refreshOnResize = this.getConfigValue(config.refreshOnResize, this.refreshOnResize);
          this.refreshOnScroll = this.getConfigValue(config.refreshOnScroll, this.refreshOnScroll);
          this.refreshOnActivity = this.getConfigValue(config.refreshOnActivity, this.refreshOnActivity);
          this.trackBrowserActivity = this.getConfigValue(config.trackBrowserActivity, this.trackBrowserActivity);
          this.visibilityPercentage = this.getConfigValue(config.visibilityPercentage, this.visibilityPercentage);
          this.useEngageTime = this.getConfigValue(config.useEngageTime, this.useEngageTime);
          this.refreshDisabled = this.getConfigValue(config.refreshDisabled, this.refreshDisabled);
          this.separatedRequest = this.getConfigValue(config.separatedRequest, this.separatedRequest);

          this.storeOnDom = this.getConfigValue(config.storeOnDom, this.storeOnDom);
          this.slotNamePattern = config.slotNamePattern || this.slotNamePattern;

          this.stackCommand(function () {
              var pubads = googletag.pubads();
              this.updatePrivacy(pubads);
              this.setTargeting(pubads, this.options);
          });
      },

      registerAd: function (id, ad) {
          this.ads[id] = ad;
      },

      unregisterAd: function (id) {
          delete this.ads[id];
      },

      getAd: function (id) {
          return this.ads[id];
      },

      setAllAdsSuspended: function (suspended) {
          if (suspended !== this.allAdsSuspended) {
              this.allAdsSuspended = !!suspended;
              for (var adId in this.ads) {
                  if (this.ads.hasOwnProperty(adId)) {
                      var ad = this.ads[adId];
                      ad.updateAd(false, null, true, this.allAdsSuspended);
                  }
              }
          }
      },

      addCreationCallback: function (callback, scope) {
          this.creationCallbacks.push({
              callback: callback,
              scope: scope
          });
      },

      removeCreationCallback: function (callback, scope) {
          for (var i = this.creationCallbacks.length - 1; i >= 0; i--) {
              var item = this.creationCallbacks[i];
              if (item.callback === callback && item.scope === scope) {
                  this.creationCallbacks.splice(i, 1);
              }
          }
      },

      executeCreationCallbacks: function (adConfig) {
          for (var i = 0, ii = this.creationCallbacks.length; i < ii; i++) {
              var item = this.creationCallbacks[i];
              if (item.callback) {
                  adConfig = item.callback.call(item.scope, adConfig) || adConfig;
              }
          }
          return adConfig;
      },

      getScreenSize: function () {
          return pgatour.getScreenSize();
      },

      getConfigValue: function (value, defaultValue) {
          return typeof value !== 'undefined' ? value : defaultValue;
      },

      getDeviceType: function (screenSize) {
          if (!screenSize) {
              screenSize = this.getScreenSize();
          }
          switch (screenSize) {
              case 'small': {
                  return 'phone';
              }
              case 'medium': {
                  return 'tablet';
              }
              default: {
                  return 'desktop';
              }
          }
      },

      refreshAd: function (ad) {
          if (ad.separatedRequest) {
              this.scheduleFlushSeparatedAds(ad);
          } else {
              if (this.adsToRefresh.indexOf(ad) === -1) {
                  this.adsToRefresh.push(ad);
              }
              if (ad.fastUpdate) {
                  this.flushAds();
              } else {
                  this.scheduleFlushAds();
              }
          }
      },

      suspendAd: function (ad) {
          var index = $.inArray(ad, this.adsToRefresh);
          if (index !== -1) {
              this.adsToRefresh.splice(index, 1);
          }
      },

      clearAd: function (ad) {
          this.stackCommand(function () {
              if (ad.slot) {
                  googletag.pubads().clear([ad.slot]);
              }
              if (ad.flushing) {
                  ad.flushing = false;
                  if (this.flushingAds && ++this.flushComplete >= this.flushTotal) {
                      this.flushingAds = false;
                      this.scheduleFlushAds();
                  }
              }
          });
      },

      getViewportMargins: function (viewportMargins) {
          var getFloatHeight = function (floatEl) {
              return floatEl.find('.float-content').height() || floatEl.height() || 0;
          };
          viewportMargins = $.extend({
              top: 0,
              bottom: 0,
              left: 0,
              right: 0
          }, viewportMargins || this.viewportMargins);

          $('.float-top').each(function () {
              viewportMargins.top += getFloatHeight($(this));
          });
          $('.float-bottom').each(function () {
              viewportMargins.bottom += getFloatHeight($(this));
          });

          return viewportMargins;
      },

      scheduleFlushAds: function () {
          if (!this.flushingAds && this.adsToRefresh.length) {
              this.flushingAds = true;
              setTimeout(this.proxy(this.flushAds), this.flushDelay);
          }
      },

      scheduleFlushSeparatedAds: function (ad) {
          if (ad && (this.separatedAdsToRefresh.indexOf(ad) === -1)) {
              this.separatedAdsToRefresh.push(ad);
          }
          if (!this.flushingSeparatedAds && this.separatedAdsToRefresh.length) {
              this.flushingSeparatedAds = true;
              setTimeout(this.proxy(this.flushSeparatedAds), this.flushDelay);
          }
      },

      flushSeparatedAds: function () {
          for (var i=0; i<this.separatedAdsToRefresh.length; i++) {
              setTimeout(this.proxy(this.flushSingleAd, this.separatedAdsToRefresh[i]), i*100);
          }
          this.separatedAdsToRefresh = [];
          this.flushingSeparatedAds = false;
      },

      flushSingleAd: function (ad) {
          this.flushAds();
          if (this.adsToRefresh.indexOf(ad) === -1) {
              this.adsToRefresh.push(ad);
          }
          this.flushAds();
      },

      flushAds: function () {
          this.stackCommand(function () {
              var pubads = googletag.pubads();

              if (!this.adsToRefresh.length) {
                  this.flushingAds = false;
                  return;
              }
              this.updatePrivacy(pubads);
              if (!this.initialized) {
                  if (global.Krux) {
                      this.setTargeting(pubads, {
                          ksg: global.Krux.segments,
                          kuid: global.Krux.user
                      });
                  }
                  this.passAdobeUserIdToDFP(pubads);
                  if (this.enableSingleRequest) {
                      pubads.enableSingleRequest();
                      pubads.disableInitialLoad();
                  }
                  if (this.refreshUnfilledSlots) {
                      googletag.companionAds().setRefreshUnfilledSlots(true);
                  }
                  pubads.addEventListener('slotRenderEnded', this.proxy(this.onSlotRendered));
                  pubads.addEventListener('impressionViewable', this.proxy(this.onViewable));
                  pubads.addEventListener('slotVisibilityChanged', this.proxy(this.onSlotVisibilityChanged));
                  googletag.enableServices();
                  this.initialized = true;
              }

              var slots = [];
              this.flushComplete = 0;
              this.flushTotal = this.adsToRefresh.length;
              this.displaySlots(slots);

              if (this.enableSingleRequest) {
                  this.triggerRequestEventForAds();
                  pubads.clear(slots);
                  pgatour.WebPerformanceTracker.trackFirstAdRequests(this.adsToRefresh, this.options);
                  pubads.refresh(slots);
              }
              this.adsToRefresh = [];
          });
      },

      displaySlots: function (slots) {
          $.each(this.adsToRefresh, this.proxy(function (i, ad) {
              ad.flushing = true;
              if (ad.slotConstructor) {
                  ad.slot = ad.slotConstructor();
                  ad.slotConstructor = null;
              }
              var slot = ad.slot;
              if (slot) {
                  this.setTargeting(slot, ad.options);
                  if (!slot.displayed) {
                      slot.displayed = true;
                      var slotId = slot.getSlotId().getDomId();
                      googletag.display(slotId);
                  }
                  slots.push(slot);
              } else {
                  pgatour.log('AD: Slot does not exist: ' + ad.options.pos, 'ERROR');
                  this.flushComplete++;
                  ad.flushing = false;
              }
          }));
      },

      passAdobeUserIdToDFP: function (slot) {
          if (!global.visitor) {
              return;
          }
          var aid = global.visitor.getMarketingCloudVisitorID();
          if (aid) {
              this.setTargeting(slot, {
                  aid: aid
              });
          }
          var aamid = $.cookie('aam_uuid');
          if (aamid) {
              this.setTargeting(slot, {
                  aamid: aamid
              });
          }
      },

      setTargeting: function (slot, options) {
          for (var option in options) {
              if (options.hasOwnProperty(option) && options[option] !== undefined) {
                  slot.setTargeting(option, options[option]);
              }
          }
      },

      setPrivacy: function(privacy) {
          this.adsPrivacy = privacy;
      },

      updatePrivacy: function(pubads) {
          if (this.requireCCPA) {
              pubads.setPrivacySettings({
                  'restrictDataProcessing': !!this.adsPrivacy
              });
          }
          if (this.requireGDPR) {
              pubads.setRequestNonPersonalizedAds(this.adsPrivacy);
          }
      },

      onSlotRendered: function (event) {
          var slot = event.slot;
          var ad = slot.ad;
          ad.flushing = false;
          ad.empty = event.isEmpty;
          ad.size.width = event.size && event.size[0] || 0;
          ad.size.height = event.size && event.size[1] || 0;
          ad.onRendered();
          if (++this.flushComplete >= this.flushTotal) {
              this.flushingAds = false;
              this.scheduleFlushAds();
          }
          pgatour.EngageTimer.onSlotRendered(event);
      },

      stackCommand: function (command) {
          googletag.cmd.push(this.proxy(command));
      },

      loadGptScript: function () {
          this.loaded = true;
          pgatour.AsyncScriptLoader.load(this.gptScriptUrl, this.proxy(this.onGptScriptLoadCompleted));
      },

      proxy: function (fn) {
          return $.proxy.apply($, [fn, this].concat(pgatour.getArgs(arguments, 1)));
      },

      triggerRequestEventForAds: function () {
          for (var i = 0; i < this.adsToRefresh.length; i++) {
              this.adsToRefresh[i].onAdRequest();
          }
      },

      onEngageTimer: function (adId) {
          var ad = this.getAd(adId);
          ad.getGroup().updateAds(true, 'timedrefresh');
      },

      onGptScriptLoadCompleted: function (success) {
          if (!success) {
              return;
          }
          pgatour.WebPerformanceTracker.trackGptScriptLoad();
      },

      onViewable: function (event) {
          var slot = event.slot;
          var ad = slot.ad;
          ad.onViewable();

          if (ad.isFirstShow) {
              pgatour.WebPerformanceTracker.trackFirstAdShow(ad, this.options);
              ad.isFirstShow = false;
          }
      },

      onSlotVisibilityChanged: function (event) {
          var slot = event.slot;
          var ad = slot.ad;
          ad.onVisibilityChanged(event.inViewPercentage);
      }
  };
})(jQuery, window, pgatour);
/*
* Copyright (c) 2016 Omnigon Communications, LLC. All rights reserved.
*
* This software is the confidential and proprietary information of Omnigon Communications, LLC
* ("Confidential Information"). You shall not disclose such Confidential Information and shall access and use it only
* in accordance with the terms of the license agreement you entered into with Omnigon Communications, LLC, its
* subsidiaries, affiliates or authorized licensee. Unless required by applicable law or agreed to in writing, this
* Confidential Information is provided on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
* express or implied. See the license agreement for the specific language governing permissions and limitations.
*/

(function ($, global, pgatour) {
  var googletag = global.googletag = global.googletag || {};
  googletag.cmd = googletag.cmd || [];

  var OUT_OF_PAGE = 'out-of-page';
  var FLUID_SIZE = 'fluid';

  var Ad = pgatour.Ad = pgatour.Ad || pgatour.BaseModule.extend({

      networkCode: undefined,
      site: undefined,
      size: undefined,
      group: undefined,
      options: undefined,
      justInTime: undefined,
      justOnScroll: undefined,
      refreshInterval: undefined,
      refreshOnResize: undefined,
      refreshOnScroll: undefined,
      refreshOnActivity: undefined,
      companionAd: false,
      trackBrowserActivity: undefined,
      useEngageTime: undefined,
      refreshDisabled: undefined,
      visibilityPercentage: undefined,
      cancelInit: false,
      suspendable: true,
      suspended: false,
      closeButton: false,
      stickyAdExpire: 0,
      viewportMargins: undefined,

      initialized: false,
      removed: false,
      ads: undefined,
      currentAd: null,
      groups: null,
      firstLayout: true,
      adActive: true,
      adVisible: true,
      renderCallbacks: null,

      /**
       * Options for the config object in Ad([container, config):
       * adId: String (optional)
       * adClass: String (optional). Default is "undefined"
       * group: Object/String (optional). Used to bulk ads into logical groups to perform operations on
       * networkCode: String (optional)
       * site: String (optional)
       * size: Array
       * options: Object (optional). If not specified, interstitial Ad is created
       * justInTime: Boolean (optional). Default is "undefined" (inherits from Ad.justInTime).
       *             Ad will be created/updated only if it's inside visible screen area.
       * justOnScroll: Boolean (optional). Default is "undefined" (inherits from Ad.justOnScroll).
       *             Ad will be created/updated when user scroll page.
       * refreshInterval: Number (optional). In sec. Default is "undefined" (inherits from Ad.refreshInterval)
       * refreshOnResize: Boolean (optional). Default is "undefined" (inherits from Ad.refreshOnResize).
       *                  Wherever Ad should be updated once layout is changed.
       * refreshOnScroll: String/Boolean (optional). Default is "undefined" (inherits from Ad.refreshOnScroll).
       *                  Wherever Ad should be updated once scrolled back to.
       * refreshOnActivity: String/Boolean (optional). Default is "undefined" (inherits from Ad.refreshOnActivity).
       *                    Wherever Ad should be updated once page is activated.
       * companionAd: Boolean (optional). Default is "false".
       * separatedRequest: Boolean (optional). Default is true (inherits from Ad.separatedRequest)
       *                  Request to DFP should be separated
       * trackBrowserActivity: Boolean (optional). Default is "undefined" (inherits from Ad.trackBrowserActivity)
       * useEngageTime: Boolean (optional). Default is "undefined" (inherits from Ad.useEngageTime)
       * refreshDisabled Boolean (optional). Defaulf is "undefined" (inherits from Ad.refreshDisabled)
       * visibilityPercentage: Number/Boolean (optional). Default is "undefined"
       *                       (inherits from Ad.visibilityPercentage)
       * storeOnDom: Boolean (optional). Default is "undefined" (inherits from Ad.storeOnDom)
       * cancelInit: Boolean (optional). Default is "false".
       * suspendable: Boolean (optional). Default is "true".
       * suspended: Boolean (optional). Default is "false".
       * slotNamePattern: String (optional)
       * onRender: Function (ad)
       */
      constructor: function (container, config) {
          if ($.isPlainObject(container)) {
              config = container;
              container = null;
          }
          if (container && !$(container).length) {
              return;
          }
          config = Ad.executeCreationCallbacks(config);
          if (config.cancelInit) {
              return;
          }
          this.configProperties(config);
          this.ads = {};
          this.groups = {};
          this.renderCallbacks = [];
          this.base(container);
          this.initAdElement(config);
      },

      initAdElement: function (config) {
          Ad.registerAd(this.id, this);
          if (config.adId) {
              Ad.registerAd(config.adId, this);
          }
          if (config.adClass) {
              this.container.addClass(config.adClass);
          }
          if (Ad.adClass) {
              this.container.addClass(Ad.adClass);
          }
          this.initDomStore(config);
          this.container.addClass('ad-pack ' + this.options.pos);
          this.appendAdTestElements();
          this.addTimer();
          this.updateMinSize();
      },

      configProperties: function (config) {
          this.networkCode = config.networkCode || this.networkCode;
          this.site = config.site || this.site;
          this.size = config.size || this.size;
          this.group = config.group;
          this.options = $.extend({}, config.options);
          this.justInTime = Ad.getConfigValue(config.justInTime, Ad.justInTime);
          this.justOnScroll = Ad.getConfigValue(config.justOnScroll, Ad.justOnScroll);
          this.refreshInterval = Ad.getConfigValue(config.refreshInterval, Ad.refreshInterval);
          this.refreshOnResize = Ad.getConfigValue(config.refreshOnResize, Ad.refreshOnResize);
          this.refreshOnScroll = Ad.getConfigValue(config.refreshOnScroll, Ad.refreshOnScroll);
          this.refreshOnActivity = Ad.getConfigValue(config.refreshOnActivity, Ad.refreshOnActivity);
          this.companionAd = !!config.companionAd;
          this.closeButton = !!config.closeButton;
          this.stickyAdExpire = config.stickyAdExpire;
          this.trackBrowserActivity = Ad.getConfigValue(config.trackBrowserActivity, Ad.trackBrowserActivity);
          this.useEngageTime = Ad.getConfigValue(config.useEngageTime, Ad.useEngageTime);
          this.separatedRequest = Ad.getConfigValue(config.separatedRequest, Ad.separatedRequest);
          this.refreshDisabled = Ad.getConfigValue(config.refreshDisabled, Ad.refreshDisabled);
          this.visibilityPercentage = Ad.getConfigValue(config.visibilityPercentage, Ad.visibilityPercentage);
          this.suspendable = Ad.getConfigValue(config.suspendable, true);
          this.suspended = !!config.suspended || !!config.suspendInitialization;
          this.slotNamePattern = config.slotNamePattern || this.slotNamePattern;
          this.onRender = config.onRender || $.noop;
      },

      initDomStore: function (config) {
          var storeOnDom = Ad.getConfigValue(config.storeOnDom, Ad.storeOnDom);
          if (storeOnDom) {
              this.container.data('ad-api', this);
          }
      },

      init: function () {
          /*
           * wait for next tick in case several ads will be created synchronously within the same group
           */
          if (!this.justOnScroll) {
              setTimeout(this.proxy(this.initAd), 10);
          }
      },

      update: function (options, reason) {
          if (!this.container) {
              return;
          }
          this.suspended = false;
          this.container.removeClass(this.options.pos);
          this.updateOptions(options);
          this.container.addClass(this.options.pos);
          this.getGroup().updateAds(false, reason || 'businesslogic');
      },

      suspend: function () {
          if (!this.container) {
              return;
          }
          if (this.suspendable) {
              this.suspended = true;
              this.getGroup().updateAds(false, null, true, true);
          }
      },

      resume: function (reason) {
          if (!this.container) {
              return;
          }
          this.suspended = false;
          this.getGroup().updateAds(false, reason || 'businesslogic', true);
      },

      remove: function () {
          Ad.suspendAd(this.currentAd);
          this.clear();
          Ad.unregisterAd(this.id);
          this.getGroupsForAllScreenSizes().forEach(this.proxy(this.removeAdFromGroup));
          this.removeTimer();
          this.unbindEvents();
          this.removed = true;
      },

      removeAdFromGroup: function (group) {
          group.removeAd(this.id);
      },

      unbindEvents: function () {
          pgatour.BrowserActivityWatcher.unbind(this.onBrowserActivity, this);
          pgatour.DocumentSizeWatcher.unbind(this.onBrowserViewportChange, this);
      },

      addRenderCallback: function (callback, scope, data) {
          return this.on('render', callback, scope, data);
      },

      addViewableCallback: function (callback, scope, data) {
          return this.on('viewable', callback, scope, data);
      },

      addRequestCallback: function (callback, scope, data) {
          return this.on('request', callback, scope, data);
      },

      addVisibilityChangedCallback: function (callback, scope, data) {
          return this.on('visibilityChanged', callback, scope, data);
      },

      removeViewableCallback: function (callback) {
          return this.un('viewable', callback);
      },

      removeRenderCallback: function (callback) {
          return this.un('render', callback);
      },

      removeRequestCallback: function (callback) {
          return this.un('request', callback);
      },

      removeVisibilityChangedCallback: function (callback) {
          return this.un('visibilityChanged', callback);
      },

      layout: function () {
          this.layoutAd();
          pgatour.EngageTimer.onBreakpointChanged(this.id);
      },

      resize: function () {
          this.onBrowserViewportChange();
      },

      scroll: function (down) {
          if (this.justOnScroll && !this.initialized) {
              this.update();
          }
          this.onBrowserViewportChange(down);
      },

      clear: function () {
          for (var type in this.ads) {
              if (this.ads.hasOwnProperty(type)) {
                  var ad = this.ads[type];
                  if (ad) {
                      ad.empty = true;
                      ad.size.width = 0;
                      ad.size.height = 0;
                      Ad.clearAd(ad);
                  }
              }
          }
      },

      initAd: function () {
          if (!this.initialized) {
              this.initialized = true;
              if (this.trackBrowserActivity) {
                  this.adActive = pgatour.BrowserActivityWatcher.isActive();
                  pgatour.BrowserActivityWatcher.bind(this.onBrowserActivity, this);
              }
              if (this.justInTime) {
                  this.adVisible = this.isAdVisible();
                  pgatour.DocumentSizeWatcher.bind(this.onBrowserViewportChange, this);
              }
          }
          if (!Ad.loaded) {
              Ad.loadGptScript();
          }
      },

      // entry point for normal and breakpoint change workflow
      layoutAd: function () {
          if (this.removed) {
              return;
          }
          this.updateMinSize();

          if (!this.initialized) {
              return;
          }

          this.hideAllAds();

          var loadReason = this.firstLayout ? 'businesslogic' : 'browserresize';
          this.setLoadReasonTarget(loadReason);
          if (this.adActive && this.getGroup().isAdVisible()) {
              var screenSize = Ad.getScreenSize();
              this.currentAd = this.ads[screenSize];
              if (!this.currentAd) {
                  this.currentAd = this.createAd(screenSize);
                  this.refreshCurrentAd();
              } else {
                  if (this.currentAd.invalid || (this.refreshOnResize && !this.firstLayout)) {
                      this.currentAd.invalid = !this.refreshCurrentAd();
                  }
              }
              this.showCurrentAd();
          }
          this.firstLayout = false;
      },

      // entry point for timer, browser activity, scroll and manual update workflow
      updateAd: function (automatic, reason, noInvalidate, noRefresh) {
          if (!this.initialized) {
              this.initAd();
          }
          this.setLoadReasonTarget(reason);
          if (!noInvalidate) {
              var types = Object.keys(this.ads);
              for (var i = 0; i < types.length; i++) {
                  var ad = this.ads[types[i]];
                  ad.invalid = true;
              }
          }
          var adIsActiveAndVisible = this.adActive && this.getGroup().isAdVisible();
          var adRefreshed = false;
          if (adIsActiveAndVisible) {
              var screenSize = Ad.getScreenSize();
              this.currentAd = this.ads[screenSize];
              if (!this.currentAd) {
                  this.currentAd = this.createAd(screenSize);
                  this.refreshCurrentAd();
              } else {
                  if ((this.currentAd.invalid && !noRefresh) || this.currentAd.slotConstructor) {
                      adRefreshed = this.refreshCurrentAd();
                      this.currentAd.invalid = !adRefreshed;
                  }
              }
              this.showCurrentAd();
          } else {
              this.getGroup().suspendAds();
          }
      },

      // initiates Ad creation
      createAd: function (screenSize) {
          var ad;
          var options = this.options;
          var adSize = this.getAdSize(screenSize);
          var fastUpdate = (options.pos === 'bottom' && this.isSmallScreen()) || this.justOnScroll;
          if (adSize && adSize.length && options.pos) {
              var slotId = pgatour.generateId('ad-' + screenSize);
              var template = '<div class="ad-block {type}"><div id="{slotId}" class="ad-slot"></div></div>';
              var $adContainer = $(pgatour.format(template, {
                  slotId: slotId,
                  type: screenSize
              })).appendTo(this.$engageTimerContainer || this.container);
              ad = this.ads[screenSize] = {
                  id: slotId,
                  timerId: this.id,
                  options: options,
                  container: $adContainer,
                  fastUpdate: fastUpdate,
                  separatedRequest: this.separatedRequest,
                  type: screenSize,
                  invalid: false,
                  empty: true,
                  isFirstShow: true,
                  size: {
                      width: 0,
                      height: 0
                  }
              };
              ad.onRendered = this.proxy(this.onAdRendered, ad);
              ad.onViewable = this.proxy(this.onAdViewable, ad);
              ad.onAdRequest = this.proxy(this.onAdRequest, ad);
              ad.onVisibilityChanged = this.proxy(this.onAdSlotVisibilityChanged, ad);
              var slotNamePattern = this.slotNamePattern || Ad.slotNamePattern;
              var slotName = pgatour.format(slotNamePattern, {
                  networkCode: Ad.getConfigValue(this.networkCode, Ad.networkCode),
                  site: Ad.getConfigValue(this.site, Ad.site),
                  device: Ad.getDeviceType(screenSize),
                  s1: Ad.getConfigValue(options.s1, Ad.options.s1),
                  s2: Ad.getConfigValue(options.s2, Ad.options.s2),
                  s3: Ad.getConfigValue(options.s3, Ad.options.s3),
                  s4: Ad.getConfigValue(options.s4, Ad.options.s4)
              });

              // remove trailing "/"
              while (slotName.charAt(slotName.length - 1) === '/') {
                  slotName = slotName.substr(0, slotName.length - 1);
              }
              ad.slotConstructor = this.proxy(this.slotConstructor, ad, adSize, slotId, slotName, this.companionAd);
          } else {
              this.onRender(this);
          }
          return ad;
      },

      slotConstructor: function (ad, adSize, slotId, slotName, companionAd) {
          if (adSize !== OUT_OF_PAGE) {
              ad.slot = googletag.defineSlot(slotName, adSize, slotId);
          } else {
              ad.slot = googletag.defineOutOfPageSlot(slotName, slotId);
          }
          var slot = ad.slot;
          slot.ad = ad;
          slot.addService(googletag.pubads());
          if (companionAd) {
              slot.addService(googletag.companionAds());
          }
          return slot;
      },

      // initiates Ad refresh
      refreshCurrentAd: function () {
          if (this.currentAd && !this.isAdSuspended()) {
              this.refreshEngageTimer();
              Ad.refreshAd(this.currentAd);
              return true;
          }
          return false;
      },

      suspendCurrentAd: function () {
          if (this.currentAd) {
              Ad.suspendAd(this.currentAd);
          }
      },

      showCurrentAd: function () {
          if (this.currentAd) {
              this.currentAd.container.show();
          }
      },

      hideAllAds: function () {
          this.currentAd = null;
          for (var type in this.ads) {
              if (this.ads.hasOwnProperty(type)) {
                  this.ads[type].container.hide();
              }
          }
      },

      getGroup: function () {
          var screenSize = this.getScreenSize();
          var group = this.groups[screenSize];
          if (!group) {
              var groupId = this.group;
              if (pgatour.isObject(groupId)) {
                  groupId = groupId[screenSize];
              }
              if (groupId) {
                  groupId += '-' + screenSize;
              }
              group = this.groups[screenSize] = pgatour.AdGroup.registerAd(this, groupId);
          }
          return group;
      },

      getGroupsForAllScreenSizes: function () {
          var screenSizes = pgatour.getAllScreenSizes();
          var groups = [];
          for (var i = 0; i < screenSizes.length; i++) {
              if (this.groups[screenSizes[i]]) {
                  groups.push(this.groups[screenSizes[i]]);
              }
          }
          return groups;
      },

      refreshEngageTimer: function () {
          pgatour.EngageTimer.clear(this);
      },

      getAdSize: function (screenSize) {
          var size = this.size;
          if (size === undefined) {
              return undefined;
          }
          return $.isArray(size) ? size : size[screenSize];
      },

      updateMinSize: function () {
          if (!this.container) {
              return;
          }
          var screenSize = Ad.getScreenSize();
          var minAdSize = this.getMinAdSize(screenSize);
          this.container.css({
              minWidth: minAdSize.width,
              minHeight: minAdSize.height
          });
          var adAvailable = (minAdSize.width * minAdSize.height) !== 0;
          this.container.toggleClass('active', adAvailable);
      },

      updateOptions: function (options) {
          this.options = $.extend(this.options, options);
      },

      getMinAdSize: function (screenSize) {
          var size = this.getAdSize(screenSize);
          var specialAd = size && (size === FLUID_SIZE || size.indexOf(FLUID_SIZE) !== -1 || size === OUT_OF_PAGE);
          var minValue = specialAd ? 5 : 0;
          var minSize = {
              width: minValue,
              height: minValue
          };
          if (size && size.length && !specialAd) {
              if ($.isArray(size[0])) {
                  for (var i = 0, ii = size.length; i < ii; i++) {
                      this.calcMinSize(minSize, size[i]);
                  }
              } else {
                  this.calcMinSize(minSize, size);
              }
          }
          return minSize;
      },

      calcMinSize: function (minSize, adSize) {
          if (minSize.width === 0 || minSize.width > adSize[0]) {
              minSize.width = adSize[0];
          }
          if (minSize.height === 0 || minSize.height > adSize[1]) {
              minSize.height = adSize[1];
          }
      },

      hasContent: function () {
          if (this.currentAd) {
              return !this.currentAd.empty;
          } else {
              return false;
          }
      },

      getContentSize: function () {
          var size = {
              width: 0,
              height: 0
          };
          if (this.currentAd) {
              size.width = this.currentAd.size.width;
              size.height = this.currentAd.size.height;
          }
          return size;
      },

      setLoadReasonTarget: function (reason) {
          if (!Ad.initialized) {
              reason = 'page';
          }
          if (reason) {
              this.options.load = reason;
          }
      },

      isAdVisible: function () {
          if (!this.container) {
              return false;
          }
          return !this.justInTime ||
              this.container.visible(this.visibilityPercentage, true, 'both', {
                  viewportMargins: Ad.getViewportMargins(this.viewportMargins)
              }) || this.container.closest('.float-top').size() > 0;
      },

      getVisibilityPercentage: function () {
          var offset = this.container[0].getBoundingClientRect();
          var viewportSize = pgatour.getViewportSize();
          var topOffset = Math.abs(Math.min(offset.top, 0) * offset.width);
          var bottomOffset = Math.abs(Math.min(viewportSize.height - offset.bottom, 0) * offset.width);
          var leftOffset = Math.abs(Math.min(offset.left, 0) * offset.height);
          var rightOffset = Math.abs(Math.min(viewportSize.width - offset.right, 0) * offset.height);
          var offsetArea = topOffset + bottomOffset + leftOffset + rightOffset;
          var percentage = 0;
          if (offset.width && offset.height) {
              percentage = Math.round(100 - offsetArea / (offset.width * offset.height / 100));
          }
          return Math.min(Math.max(percentage, 0), 100);
      },

      isAdSuspended: function () {
          return this.suspendable && (this.suspended || Ad.allAdsSuspended);
      },

      isBottomCloseAd: function () {
          return !!this.closeButton;
      },

      isRefreshOnScroll: function (down) {
          var mode = this.refreshOnScroll;
          var isUp = mode === 'up' && !down;
          var isDown = mode === 'down' && down;
          return ([true, 'both']).indexOf(mode) !== -1 || isUp || isDown;
      },

      appendAdTestElements: function () {
          if (!pgatour.getUrlParam('pgat_ad_test')) {
              return;
          }
          this.$adTestContainer = $(pgatour.format('<div class="ad-test"></div>', {})).css({
              position: 'relative',
              zIndex: 1,
              fontSize: 12,
              textAlign: 'left',
              display: 'inline',
              backgroundColor: '#F00',
              color: '#FFF'
          }).appendTo(this.container);
      },

      addTimer: function () {
          pgatour.EngageTimer.add(this);
      },

      removeTimer: function () {
          pgatour.EngageTimer.remove(this);
      },

      isFluidAd: function () {
          var ad = this.currentAd;
          return !!ad && !ad.empty && ad.size.width === 0 && ad.size.height === 0;
      },

      onAdRendered: function () {
          try {
              this.fireEvent('render');
          } catch (e) {
              pgatour.log(e.toString(), 'ERROR');
          }
          try {
              if (this.onRender) {
                  this.onRender(this);
              }
          } catch (e) {
              pgatour.log(e.toString(), 'ERROR');
          }
          this.container.closest('.ad-new').toggleClass(FLUID_SIZE, this.isFluidAd());
      },

      onBrowserActivity: function (event, active) {
          if (this.adActive !== active) {
              this.adActive = active;
              var group = this.getGroup();
              if (active) {
                  group.updateAds(true, 'activityrefresh', !this.refreshOnActivity);
              } else {
                  if (!group.isAdVisible()) {
                      group.suspendAds();
                  }
              }
          }
      },

      onBrowserViewportChange: function (down) {
          if (this.removed) {
              return;
          }
          if (this.justInTime) {
              var visible = this.isAdVisible();
              if (this.adVisible !== visible) {
                  this.onAdVisibilityChanged(visible, down);
              }
          }
          var visibilityPercentage = this.getVisibilityPercentage();
          if (this.visibilityPercentage !== visibilityPercentage) {
              this.visibilityPercentage = visibilityPercentage;
              pgatour.EngageTimer.onAdVisibilityChange(this.id, this.visibilityPercentage);
          }
      },

      onAdVisibilityChanged: function (visible, down) {
          this.adVisible = visible;
          var group = this.getGroup();
          if (visible) {
              var refresh = this.isRefreshOnScroll(down !== false);
              group.updateAds(true, 'browserscroll', !refresh);
          } else {
              if (!group.isAdVisible()) {
                  group.suspendAds();
              }
          }
      },

      onAdViewable: function () {
          this.fireEvent('viewable');
      },

      onAdRequest: function () {
          this.fireEvent('request');
      },

      onAdSlotVisibilityChanged: function (ad, data) {
          this.fireEvent('visibilityChanged', data);
      }

  }, pgatour.AdUtils);
})(jQuery, window, pgatour);

/*
* Copyright (c) 2016 Omnigon Communications, LLC. All rights reserved.
*
* This software is the confidential and proprietary information of Omnigon Communications, LLC
* ("Confidential Information"). You shall not disclose such Confidential Information and shall access and use it only
* in accordance with the terms of the license agreement you entered into with Omnigon Communications, LLC, its
* subsidiaries, affiliates or authorized licensee. Unless required by applicable law or agreed to in writing, this
* Confidential Information is provided on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
* express or implied. See the license agreement for the specific language governing permissions and limitations.
*/

(function ($, global, pgatour) {
  var AdSticky = pgatour.AdSticky = pgatour.AdSticky || pgatour.BaseModule.extend({

      $windowEl: null,
      $bodyEl: null,
      $adContainerEl: null,
      $stickyMarkerContainerEl: null,
      $stickyMarkerEl: null,

      ad: null,
      visible: false,
      // this value is set externally
      hideAd: {},

      showTimer: null,
      hideTimer: null,

      hiddenClass: 'ad-hidden',
      cookieName: 'hideStickyAd',
      visibilityEventName: 'onStickyAdToggleVisibility',
      closeMsgTmp: '{page} Adhesive Unit Close Button Click',

      setup: function () {
          this.$adContainerEl = this.container.parent();
          this.$adContainerEl.addClass(this.hiddenClass);
          this.$adContainerEl.closest('.ad-new').addClass('sticky');
          this.$stickyMarkerContainerEl = $('<div class="ad-sticky-marker-container"></div>');
          this.$stickyMarkerEl = $('<div class="ad-sticky-marker"></div>').appendTo(this.$stickyMarkerContainerEl);
          this.$adContainerEl.before(this.$stickyMarkerContainerEl);
      },

      init: function () {
          this.$windowEl = $(window);
          this.$bodyEl = $('body');

          // move sticky ad to body per PTMP-373
          if (!pgatour.isEditMode()) {
              this.$bodyEl.append(this.$adContainerEl);
          }

          this.obtainAdApi();

          // capture viewport size changes
          pgatour.DocumentSizeWatcher.bind(this.onBrowserViewportChange, this);
          // capture show/hide events
          this.$bodyEl.bind('toggle-ad-visibility', this.proxy(this.onToggleAdVisibility));

          this.addCloseButton();

          this.checkStickyAd();
      },

      obtainAdApi: function () {
          if (this.container.length) {
              this.container.data('ad-sticky-api', this);
              this.ad = this.container.data('ad-api');

              // override global viewport margins
              this.ad.viewportMargins = {};
              this.ad.addRenderCallback(this.onAdRendered, this);
              this.ad.addViewableCallback(this.onAdViewable, this);
              this.ad.addRequestCallback(this.onAdRequested, this);
          }
      },

      addCloseButton: function () {
          if (this.ad.isBottomCloseAd()) {
              this.$stickyCloseEl = $('<button aria-label="Close ad" class="ad-sticky-close">Close</button>')
                  .addClass('hidden')
                  .appendTo(this.$adContainerEl.find('.ad-sticky'));
              this.$stickyCloseEl.bind('click', this.proxy(this.closeStickyAd));
          }
      },

      closeStickyAd: function () {
          var config = {
              path: '/'
          };
          var omnitureCloseMessage = this.getOmnitureCloseMessage();
          if (this.ad.stickyAdExpire !== 0) {
              config.expires = this.ad.stickyAdExpire / 24;
          }
          $.cookie(this.cookieName, true, config);
          global.pgatour.Omniture.trackLink(omnitureCloseMessage, null, null);
          this.hideStickyAd();
          this.triggerToggleVisibilityEvent(false);
      },

      hideStickyAd: function () {
          if (this.container && this.container.parent()) {
              this.hideTimer = null;
              this.container.parent().addClass(this.hiddenClass);
              this.toggleCloseButton(false);
          }
      },

      toggleCloseButton: function (visible) {
          if (this.$stickyCloseEl) {
              this.$stickyCloseEl.toggleClass('hidden', !visible);
          }
      },

      triggerToggleVisibilityEvent: function (visible) {
          var event = new CustomEvent(this.visibilityEventName, {
              detail: {visible: visible}
          });
          window.dispatchEvent(event);
      },

      resize: function () {
          this.checkStickyAd();
      },

      scroll: function () {
          this.checkStickyAd();
      },

      update: function () {
          this.checkStickyAd();
      },

      doNotShowStickyAd: function () {
          return $.cookie(this.cookieName);
      },

      checkStickyAd: function () {
          if (this.doNotShowStickyAd()) {
              this.hideStickyAd();
              return false;
          }
          var viewportMargins = pgatour.Ad.getViewportMargins();
          var markerOffset = this.$stickyMarkerEl.offset();
          var bodyWidth = this.$bodyEl.innerWidth();
          var visibleLogic =
              this.$stickyMarkerEl.is(':visible') &&
              $.isEmptyObject(this.hideAd);
          var visibleOffsets =
              this.$windowEl.scrollTop() + viewportMargins.top > markerOffset.top &&
              markerOffset.left >= 0 &&
              markerOffset.left < bodyWidth;
          var visible = visibleLogic && visibleOffsets;
          if (this.visible !== visible) {
              this.changeVisibility(visible);
          }
          return true;
      },

      changeVisibility: function (visible) {
          this.visible = visible;
          this.container.parent().toggleClass(this.hiddenClass, !visible);
          this.updateBodyMargins();
          if (this.ad) {
              if (visible) {
                  this.ad.update();
              } else {
                  this.ad.clear();
                  this.toggleCloseButton(false);
              }
              this.triggerToggleVisibilityEvent(visible);
          }
      },

      updateBodyMargins: function () {
          var adHeight = this.visible ? this.container.outerHeight() : 0;
          var margins = {
              top: 0,
              bottom: 0
          };
          if (this.container.hasClass('bottom')) {
              margins.bottom = adHeight;
              this.$bodyEl.css('margin-bottom', adHeight);
          }
          if (this.container.hasClass('top')) {
              margins.top = adHeight;
          }
          pgatour.Ad.viewportMargins = margins;
          pgatour.DocumentSizeWatcher.invalidate();
      },

      getOmnitureCloseMessage: function () {
          var page = this.ad.options.s2 === 'news' ? 'Article' : 'Leaderboard';
          return pgatour.format(this.closeMsgTmp, { page: page });
      },

      onToggleAdVisibility: function (element, elementVisibility) {
          var visibility = this.hideAd[elementVisibility.id] === undefined;
          if (visibility !== elementVisibility.visibility) {
              if (!elementVisibility.visibility) {
                  this.hideAd[elementVisibility.id] = false;
              } else {
                  delete this.hideAd[elementVisibility.id];
              }
              this.checkStickyAd();
          }
      },

      onAdRendered: function () {
          this.updateBodyMargins();
      },

      onAdRequested: function () {
          this.toggleCloseButton(false);
      },

      onAdViewable: function () {
          if (this.ad.currentAd && !this.ad.currentAd.empty) {
              this.toggleCloseButton(true);
          }
      },

      onBrowserViewportChange: function () {
          this.checkStickyAd();
      }
  }, {

      init: function () {
          var self = this;
          $(function () {
              $('.ad-sticky').each(function () {
                  self.adSticky = new AdSticky(this);
              });
          });
      }

  });
})(jQuery, window, pgatour);

/*
* Copyright (c) 2016 Omnigon Communications, LLC. All rights reserved.
*
* This software is the confidential and proprietary information of Omnigon Communications, LLC
* ("Confidential Information"). You shall not disclose such Confidential Information and shall access and use it only
* in accordance with the terms of the license agreement you entered into with Omnigon Communications, LLC, its
* subsidiaries, affiliates or authorized licensee. Unless required by applicable law or agreed to in writing, this
* Confidential Information is provided on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
* express or implied. See the license agreement for the specific language governing permissions and limitations.
*/

(function ($, global, pgatour) {
  var AdFloat = pgatour.AdFloat = pgatour.AdFloat || pgatour.BaseModule.extend({
      $windowEl: null,
      ad: null,

      init: function () {
          this.$windowEl = $(window);
          if (this.container.length) {
              this.container.data('ad-float-api', this);
              this.ad = this.container.data('ad-api');
              this.ad.addRenderCallback(this.onAdRendered, this);
          }
          pgatour.DocumentSizeWatcher.bind(this.onBrowserViewportChange, this);
          this.checkFloatAd();
      },

      resizeNow: function () {
          this.checkFloatAd();
      },

      scrollNow: function () {
          this.checkFloatAd();
      },

      update: function () {
          this.checkFloatAd();
      },

      getNextBlocksHeight: function (outerEl) {
          var $nextBlocks = outerEl.nextAll().not('script, style, link');
          var nextBlocksHeight = 0;
          var i;
          var blockHeight;
          var $block;
          for (i = 0; i < $nextBlocks.length; i++) {
              $block = $nextBlocks.eq(i);
              blockHeight = $block.outerHeight() || $block.find('.module').outerHeight() || 0;
              nextBlocksHeight += blockHeight;
          }
          return nextBlocksHeight;
      },

      getAdTopSpace: function (outerEl) {
          var marginTop = parseInt(this.container.css('marginTop'), 10);
          var offsetWithoutMargin = this.container.offset().top - marginTop;
          return offsetWithoutMargin - outerEl.offset().top;
      },

      checkFloatAd: function () {
          var outerEl = this.container.closest('.ad-new');
          if (outerEl.length) {
              var viewportMargins = pgatour.Ad.getViewportMargins();
              var railEl = outerEl.parent();
              var offsetTop = this.container.parent().offset().top;
              var posTop = outerEl.position().top;
              var scrollTop = this.$windowEl.scrollTop() + viewportMargins.top;
              var spaceTop = 0;
              var adHeight = this.container.outerHeight();
              var railHeight = railEl.height();
              var nextBlocksHeight = this.getNextBlocksHeight(outerEl);
              var adTopSpace = this.getAdTopSpace(outerEl);

              if (scrollTop > offsetTop) {
                  spaceTop = scrollTop - offsetTop;
              }
              if (spaceTop + adHeight + adTopSpace > railHeight - posTop - nextBlocksHeight) {
                  spaceTop = railHeight - posTop - adHeight - adTopSpace - nextBlocksHeight;
              }

              // better solution with "position" and "top" is found, but it works jerky...
              this.container.css({
                  marginTop: spaceTop > 0 ? spaceTop : 0
              });
          }
      },

      onAdRendered: function () {
          this.checkFloatAd();
      }
  }, {
      init: function () {
          var self = this;
          $(function () {
              $('.ad-float').each(function () {
                  self.adFloat = new AdFloat(this);
              });
          });
      }
  });
})(jQuery, window, pgatour);

/*
* Copyright (c) 2016 Omnigon Communications, LLC. All rights reserved.
*
* This software is the confidential and proprietary information of Omnigon Communications, LLC
* ("Confidential Information"). You shall not disclose such Confidential Information and shall access and use it only
* in accordance with the terms of the license agreement you entered into with Omnigon Communications, LLC, its
* subsidiaries, affiliates or authorized licensee. Unless required by applicable law or agreed to in writing, this
* Confidential Information is provided on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
* express or implied. See the license agreement for the specific language governing permissions and limitations.
*/
(function ($, global, pgatour) {
  var AdBackground = pgatour.AdBackground = pgatour.AdBackground || pgatour.BaseModule.extend({

      ad: null,

      init: function () {
          /*
           * check if LB is not on the page
           */
          if (!$('.leaderboard-banner').length) {
              this.container.addClass('no-lb');
          }

          var ad = this.ad = pgatour.Ad.getAd('wallpaper');
          if (ad) {
              ad.onRender = this.proxy(this.onAdRender);
          } else {
              this.showStaticBackgroundAd();
          }
      },

      showStaticBackgroundAd: function () {
          var staticImg = this.container.find('.ad-image');
          if (staticImg.length) {
              var imgUrl = staticImg.attr('data-src');
              if (imgUrl) {
                  staticImg.attr('src', imgUrl);
              }
          }
      },

      onAdRender: function () {
          if (!this.ad.hasContent()) {
              this.showStaticBackgroundAd();
          }
      }

  }, {

      init: function () {
          var self = this;
          $(function () {
              self.adBackground = new AdBackground('.ad-background');
          });
      }

  });
})(jQuery, window, pgatour);