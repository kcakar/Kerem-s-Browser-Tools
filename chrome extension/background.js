chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if(msg.type=="link_results")
    {
        generateLinkHtml(msg.approvedLinks,msg.suspiciousLinks);
    }
    if(msg.type=="auto_link_open"){
        msg.urls.forEach(url => {
            chrome.tabs.create({ url: url });
        });
    }
    if(msg.type=="open_us_page"){
        chrome.tabs.create({ url: msg.url });
    }
});

