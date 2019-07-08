function checkLinks() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"type": "check_links"});
        window.close();
   });
}

function doQATest() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"type": "qa_test"});
        window.close();
   });
}

function ariaLabelViewer() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"type": "aria_label_viewer"});
        window.close();
   });
}

function analyticsViewer() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"type": "analytics_viewer"});
        window.close();
   });
}

function frequentlyViewer() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"type": "frequently_viewer"});
        window.close();
   });
}

function autoLink() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"type": "auto_link"});
        window.close();
   });
}

  
function cssImageCheck() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"type": "css_image_check"});
        window.close();
   });
}

function pageHeadViewer() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"type": "pageHeadViewer"});
        window.close();
   });
}

function footnoteComparer() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"type": "footnoteComparer"});
        window.close();
   });
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("qaCheck").addEventListener("click", doQATest);
  document.getElementById("checkLinks").addEventListener("click", checkLinks);
  document.getElementById("ariaLabelViewer").addEventListener("click", ariaLabelViewer);
  document.getElementById("analyticsViewer").addEventListener("click", analyticsViewer);
  document.getElementById("frequently").addEventListener("click", frequentlyViewer);
  document.getElementById("autoLink").addEventListener("click", autoLink);
  document.getElementById("cssImageCheck").addEventListener("click", cssImageCheck);
  document.getElementById("pageHeadViewer").addEventListener("click", pageHeadViewer);
  document.getElementById("footnoteComparer").addEventListener("click", footnoteComparer);
});