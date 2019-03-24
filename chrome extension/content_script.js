let locale_variable="/tr/";
let locale_short_variable="tr";
let page_locale_variable="tr_TR";
let page_lang_variable="tr-TR";
let sitename_variable="Apple (Türkiye)";
let popup_remove_variable=1500;
let support_link_variable="tr-tr";



chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if( request.type === "check_links" ) {
            checkLinks(false);
        }
        if( request.type === "qa_test" ) {
            qaCheckPromises(false);
        }
        if( request.type === "aria_label_viewer" ) {
            ariaLabelViewer();
        }
        if( request.type === "analytics_viewer" ) {
            analyticsViewer();
        }
        if( request.type === "frequently_viewer" ) {
            generateFrequentHTML();
        }
        if( request.type === "auto_link" ) {
            generateAutoLinksHtml();
        }

        if( request.type === "css_image_check" ) {
            generateCssCheckHtml();
        }

        if( request.type === "pageHeadViewer" ) {
            generateHeadViewHtml();
        }
    }
);

function generateHeadViewHtml(){
    const branch=window.location.host.replace(".apple.com","");
    const metaDesc=document.querySelector("meta[name='Description']").getAttribute("content");
    const ogDesc=document.querySelector("[property='og:description']").getAttribute("content");
    const ogImg=document.querySelector("[property='og:image']").getAttribute("content").replace("www",branch).replace("https","http");
    const ogTitle=document.querySelector("[property='og:title']").getAttribute("content");
    const title=document.querySelector("title").text;


    let html=`
    <div class='result-container'>
        <div class='close-results'>X</div>
        <div class='approved qatest' style="padding:20px;">
            <p><b>og:title</b></p>
            <span>${ogTitle}</span><br/><br/>

            <p><b>title</b></p>
            <span>${title}</span><br/><br/>

            <p><b>Meta Description:</b></p>
            <span>${metaDesc}</span><br/><br/>

            <p><b>og:description</b></p>
            <span>${ogDesc}</span><br/><br/>

            <p><b>og:image</b></p>
            <img style="border:1px dashed green;max-width:90vw" src="${ogImg}"/>

        </div>
        <style class='result-style'>${style}</style>
    `;
    hidePage();
    document.querySelector("body").parentNode.insertBefore(createElementFromHTML(html), document.querySelector("body"));
    bindWhitelistEvent();
}


function ariaLabelViewer(){
    showPage();
    
    let elements=document.querySelectorAll("[aria-label]");
    let colorIndex=0;
    elements.forEach(element=>{
        const label=element.getAttribute("aria-label");
        colorIndex++;
        if(colorIndex>12){
            colorIndex=0;
        }
        element.style.position='relative';
        let html="<div class='aria-label-viewer popup-color-"+colorIndex+"' style='left:"+element.offsetWidth/2+"px;top:"+element.offsetHeight/2+"px'><span>"+label+"</span><style class='result-style'>"+style+"</style></div>"
        element.appendChild(createElementFromHTML(html));
        element.classList.add("aria-label-highlight");
        element.classList.add("viewer-color-"+colorIndex);
    });
}

function analyticsViewer(){
    showPage();
    let elements=document.querySelectorAll("[data-analytics-region]");
    let elementArray=[...elements];

    let tempElements=document.querySelectorAll("[data-analytics-title]");

    tempElements.forEach(element=>{
        if(elementArray.indexOf(element)===-1)
        {
            elementArray.push(element);
        }
    });

    tempElements=document.querySelectorAll("[data-analytics-click]");
    tempElements.forEach(element=>{
        if(elementArray.indexOf(element)===-1)
        {
            elementArray.push(element);
        }
    });
    setAnalyticsElements(elementArray);
}

function setAnalyticsElements(elements){
    let colorIndex=0;
    elements.forEach(element=>{
        const region=element.getAttribute("data-analytics-region");
        const title=element.getAttribute("data-analytics-title");
        const click=element.getAttribute("data-analytics-click");
        element.style.position='relative';
        colorIndex++;
        if(colorIndex>12){
            colorIndex=0;
        }
        let html="<div class='aria-label-viewer popup-color-"+colorIndex+"' style='left:"+element.offsetWidth/2+"px;top:"+element.offsetHeight/2+"px'><span>region:"+region+"<br>title:"+title+"<br>click:"+click+"</span><style class='result-style'>"+style+"</style></div>"
        element.appendChild(createElementFromHTML(html));
        element.classList.add("aria-label-highlight");
        element.classList.add("viewer-color-"+colorIndex);
    });
}

function close(){
    showPage();
}

function checkLinks(countOnly){
   let links= document.querySelectorAll("a:not(.ac-gf-directory-column-section-link):not(.ac-gn-link):not(.ac-gf-footer-locale-link):not(.ac-gf-footer-legal-link):not([href='https://www.belgemodul.com/sirket/329'])");

   let whitelist=[];

   chrome.storage.sync.get({
    whitelist:[]
    }, function(result) {

    whitelist=result.whitelist;
    let suspiciousLinks=[];
    let approvedLinks=[];
    let whitelistLinks=[];

    links.forEach(link=>{
        //media ise tpl-tr olcak
        if(whitelist.indexOf(link.href)!==-1)
        {
            whitelistLinks.push(link);
        }
        else if(link.href.indexOf("support.apple")!==-1 && link.href.indexOf(support_link_variable)==-1)
        {
            suspiciousLinks.push({href:link.href,comment:"Support link. Use "+support_link_variable});
        }
        else if(link.href.indexOf("media")!==-1&&link.href.indexOf("tpl")===-1)
        {
            suspiciousLinks.push({href:link.href,comment:"Media link. tpl missing"});
        }
        else if(link.href.indexOf("help.apple")!==-1 && link.href.indexOf("lang="+locale_variable)==-1)
        {
            suspiciousLinks.push({href:link.href,comment:"Help link. add ?lang="+locale_variable});
        }
        else if(link.href.indexOf("help.apple")!==-1 && link.href.indexOf("lang="+locale_variable)!=-1)
        {
            approvedLinks.push(link.href);
        }
        else if(link.href.indexOf("support.apple")!==-1 && link.href.indexOf(support_link_variable)!=-1)
        {
            approvedLinks.push(link.href);
        }
        else if(link.href.indexOf(locale_variable)===-1)
        {
            suspiciousLinks.push({href:link.href,comment:locale_variable+" missing"});
        }
        else{
            approvedLinks.push(link.href);
        }
    });
        if(countOnly)
        {
            return suspiciousLinks.length;
        }
        else{
            generateLinkHtml(approvedLinks,suspiciousLinks,whitelistLinks);
        }
    });
}

function generateLinkHtml(approvedLinks,suspiciousLinks,whitelistLinks){
    let html="<div class='result-container'><div class='close-results'>X</div><div id='status'></div><div class='suspicious'><h1>Suspicious links</h1><ul>";
    
    suspiciousLinks.forEach(link => {
       html+="<li class='orange' style='margin-bottom:10px' data-remove='"+link.href+"'><button class='addToWhitelist' data-link='"+link.href+"'>Add to whitelist</button><span class='comment'>("+link.comment+")</span><br><a target='_blank' href='"+link.href+"'>"+link.href+"</a></li>" 
    });

    html+="</ul></div>";

    if(whitelistLinks.length>0)
    {
        html+="<div class='suspicious whitelist'><h1>Whitelisted links</h1><ul>";
        whitelistLinks.forEach(link => {
            html+="<li class='green' data-remove='"+link.href+"'><button class='removeToWhitelist' data-link='"+link.href+"'>Remove from whitelist</button><a target='_blank' href='"+link.href+"'>"+link.href+"</a></li>" 
         });
        html+="</ul></div>";
    }


    html+="<div class='approved'><h1>Approved links</h1><ul>";
    approvedLinks.forEach(link => {
        html+="<li class='green'><a target='_blank' href='"+link+"'>"+link+"</a></li>" 
     });
 
    html+="</ul></div><style class='result-style'>"+style+"</style></div>";

    hidePage();
    document.querySelector("body").parentNode.insertBefore(createElementFromHTML(html), document.querySelector("body"));
    bindWhitelistEvent();
}

function addToWhitelist(e){
    const toWhitelist=this.getAttribute("data-link");
    let newWhitelist=[];
    chrome.storage.sync.get({
        whitelist:[]
    }, function(result) {
        newWhitelist=result.whitelist;
        newWhitelist.push(toWhitelist);
        chrome.storage.sync.set({ whitelist: newWhitelist,}, function() {
            var status = document.getElementById('status');
            status.textContent = 'Whitelisted '+toWhitelist;
            let toRemove=document.querySelector("[data-remove='"+toWhitelist+"']");
            if(toRemove)
            {
                toRemove.remove();
            }
            setTimeout(function() {
                status.textContent = '';
            }, 2750);
        });
    });
}

function removeFromWhitelist(e){
    const removeWhitelist=this.getAttribute("data-link");
    let newWhitelist=[];
    chrome.storage.sync.get({
        whitelist:[]
    }, function(result) {
        newWhitelist=result.whitelist;

        let index=newWhitelist.indexOf(removeWhitelist);
        if(index!==-1)
        {
            newWhitelist.splice(index,1);
            chrome.storage.sync.set({ whitelist: newWhitelist,}, function() {
                var status = document.getElementById('status');
                status.textContent = 'Removed from whitelist: '+removeWhitelist;
                let toRemove=document.querySelector("[data-remove='"+removeWhitelist+"']");
                if(toRemove)
                {
                    toRemove.remove();
                }
                setTimeout(function() {
                    status.textContent = '';
                }, 2750);
            });
        }
    });
}

let loading=false;
function bindWhitelistEvent()
{
    if(loading)
    {
        loading=false;
    }
    let elements=document.getElementsByClassName("addToWhitelist");
    [].forEach.call(elements, function (el) {
      el.addEventListener("click",addToWhitelist);
    });

    let elements2=document.getElementsByClassName("removeToWhitelist");
    [].forEach.call(elements2, function (el) {
      el.addEventListener("click",removeFromWhitelist);
    });

    let elements3=document.getElementsByClassName("close-results");
    [].forEach.call(elements3, function (el) {
      el.addEventListener("click",close);
    });

    let elements4=document.getElementsByClassName("btn-auto-links");
    [].forEach.call(elements4, function (el) {
      el.addEventListener("click",automaticallyOpenLinks);
    });

    let elements6=document.getElementsByClassName("css-link-row");
    [].forEach.call(elements6, function (el) {
      el.addEventListener("click",checkCssImages);
    });

    let elements7=document.getElementsByClassName("compareImages");
    [].forEach.call(elements7, function (el) {
      el.addEventListener("click",compareImages);
    });

    let elements8=document.getElementsByClassName("css-auto-dimension");
    [].forEach.call(elements8, function (el) {
        try{
            fillDimension(el);
        }
        catch{
            // console.log(el);
        }
    });
    
    let txtCheck=document.getElementById("filter-images-css-check");
    if(txtCheck)
    {
        txtCheck.onchange=filterImagesByName;
        txtCheck.onkeypress = txtCheck.onchange;
        txtCheck.onpaste    = txtCheck.onchange;
        txtCheck.oninput    = txtCheck.onchange;
    }

    let dimensionCheck=document.getElementById("dimension-filter");
    if(dimensionCheck)
    {
        dimensionCheck.addEventListener("click",e=>filterByDimension(dimensionCheck));
    }

    let qaCheckBtn=document.getElementsByClassName("qaCheck");
    [].forEach.call(qaCheckBtn, function (el) {
      el.addEventListener("click",x=>qaCheckPromises(false));
    });

    let linkCheckBtn=document.getElementsByClassName("linkCheck");
    [].forEach.call(linkCheckBtn, function (el) {
      el.addEventListener("click",x=>checkLinks(false));
    });
    
}

function filterByDimension(el){
        let elements=document.querySelectorAll(".cssCheck:not(.different-size)");
        elements.forEach(e=>{
            if(el.checked){
                e.classList.add("hidden");
            }
            else{
                e.classList.remove("hidden");
            }
        })
}

function qaCheck(compareResult,isPassive){
    let results=[];
    results.push(compareResult);
    results.push(checkOGLocale());
    results.push(checkHtmlLang());
    results.push(checkHtmlXmlLang());
    results.push(checkFooterLang());
    results.push(checkOgSiteName());
    results.push(checkOgURL());
    // results.push(checkPageTitleOgTitle());
    results.push(checkMetaDescEqualsOGDesc());

    let linkResult=checkLinks(true);
    
    if(!isPassive)
    {
        results.push(checkOgDescLength());
        results.push(checkMetaDescLength());
        generateQAHTML(results.sort(compare));
    }
    else{
        if(window.location.pathname.indexOf(locale_variable)!==-1){
            showQAResultPopup(results.sort(compare),linkResult);
        }
    }
}

function qaCheckPromises(isPassive){
    if(!isPassive)
    {
        addLoadingHTML();
    }
    let usVersion="unknown";
    let trVersion="unknown";
    let usURL=window.location.href.replace(locale_variable,"/");
    if(usURL.indexOf("http")===-1){
        usURL="http://"+usURL;
    }
    fetch(usURL).then(function (response) {
        return response.text();
      })
      .then(function (pageHtml) {
          var usHTML = document.createElement('div');
          usHTML.innerHTML = pageHtml.trim();
          if(usHTML.querySelector("[src*='/built/']")&&usHTML.querySelector("[src*='/built/']").attributes["src"])
          {
            let srcValue=usHTML.querySelector("[src*='/built/']").attributes["src"].value;
            let index=usHTML.querySelector("[src*='/built/']").attributes["src"].value.split("/").indexOf("built");
            let versionIndex=index-1;
            usVersion=usHTML.querySelector("[src*='/built/']").attributes["src"].value.split("/")[versionIndex];
          }

          if(document.querySelector("[src*='/built/']")&&document.querySelector("[src*='/built/']").attributes["src"])
          {
              let srcValue=document.querySelector("[src*='/built/']").attributes["src"].value;
              let index=document.querySelector("[src*='/built/']").attributes["src"].value.split("/").indexOf("built");
              let versionIndex=index-1;
              trVersion=document.querySelector("[src*='/built/']").attributes["src"].value.split("/")[versionIndex];
          }
      
          if(usVersion===trVersion)
          {
              qaCheck({field:"Page version (comparison us url:"+usURL+")",expected:usVersion,result:true,value:trVersion},isPassive);
          }
          else{
              qaCheck({field:"Page version (comparison us url:"+usURL+")",expected:usVersion,result:false,value:trVersion},isPassive);
          }
      })
      .catch(function(){
          
      });
}

function showQAResultPopup(results,linkResult)
{

    let links= document.querySelectorAll("a:not(.ac-gf-directory-column-section-link):not(.ac-gn-link):not(.ac-gf-footer-locale-link):not(.ac-gf-footer-legal-link):not([href='https://www.belgemodul.com/sirket/329'])");

    let whitelist=[];
 
    chrome.storage.sync.get({
     whitelist:[]
     }, function(result) {
 
     whitelist=result.whitelist;
     let suspiciousLinks=[];
     let approvedLinks=[];
     let whitelistLinks=[];
 
     links.forEach(link=>{
            //media ise tpl-tr olcak
            if(whitelist.indexOf(link.href)!==-1)
            {
                whitelistLinks.push(link);
            }
            else if(link.href.indexOf(locale_variable)===-1)
            {
                suspiciousLinks.push({href:link.href,comment:locale_variable+" missing"});
            }
            else if(link.href.indexOf("media")!==-1&&link.href.indexOf("tpl")===-1)
            {
                suspiciousLinks.push({href:link.href,comment:"Media link. tpl missing (new feature)"});
            }
            else if(link.href.indexOf("support.apple")!==-1 && link.href.indexOf(support_link_variable)==-1)
            {
                suspiciousLinks.push({href:link.href,comment:"Support link. Use "+support_link_variable});
            }
            else if(link.href.indexOf("help.apple")!==-1 && link.href.indexOf("lang="+locale_variable)==-1)
            {
                suspiciousLinks.push({href:link.href,comment:"Help link. add ?lang="+locale_variable});
            }
            else if(link.href.indexOf("help.apple")!==-1 && link.href.indexOf("lang="+locale_variable)!=-1)
            {
                approvedLinks.push(link.href);
            }
            else if(link.href.indexOf("support.apple")!==-1 && link.href.indexOf(support_link_variable)!=-1)
            {
                approvedLinks.push(link.href);
            }
            else{
                approvedLinks.push(link.href);
            }
     });

     let noErrors=true;
    let linkResult=suspiciousLinks.length;
    let html="<div class='result-container-popup'><div class='close-results'>X</div>";

    // html+="<div class='approved qatest'><p><b>Detected some errors</b></p><ul>";
    html+="<div class='approved qatest'><ul>";
    if(linkResult && linkResult>0)
    {
        html+=`
        <li class='orange'>
            <span class='test-name'><b>Found <span style="color:red">${linkResult}</span> possibly not localised links</b></span><br><br>
        </li>`
    }



    let count=0;
    results.forEach(result => {
        if(!result.result)
        {
            count++;
            noErrors=false;
            // html+=`
            // <li class='orange'>
            //     <span class='test-name'><b>${result.field}</b></span><br><br>
            //     <span class='expected'><b>Expected value: </b><br>${result.expected}</span><br><br>
            //     <span class='value'><b>Found value: </b><br>${result.value}</span>
            // </li>`
        }
    });

    if(count>0)
    {
        html+=`
        <li class='orange'>
            <span class='test-name'><b>Found <span style="color:red">${count}</span> qa related errors</b></span><br><br>
        </li>`
    }

    // html+="</ul><button class='qaCheck'>Show details</button><br><button class='linkCheck'>Show link results</button></div><style class='result-style'>"+style+"</style>";

    html+="<button class='qaCheck'>Show qa results</button><br><button class='linkCheck'>Show link results</button></div><style class='result-style'>"+style+"</style>";
    
    if(!noErrors || linkResult>0)
    {
        document.querySelector("body").parentNode.insertBefore(createElementFromHTML(html), document.querySelector("body"));
        bindWhitelistEvent();
        setTimeout(function(){
           let toRemove= document.querySelector(".result-container-popup");
           if(toRemove)
           {
               toRemove.remove();
           }
        },popup_remove_variable);
    }
     });
     
    
}

function addLoadingHTML(){
    return;
    loading=true;
    let html=
    `<div class="loading-div-extension">
        <div class="sk-folding-cube">
            <div class="sk-cube1 sk-cube"></div>
            <div class="sk-cube2 sk-cube"></div>
            <div class="sk-cube4 sk-cube"></div>
            <div class="sk-cube3 sk-cube"></div>
        </div>
        <style>
        .sk-folding-cube {
            margin: 20px auto;
            width: 40px;
            height: 40px;
            position: relative;
            -webkit-transform: rotateZ(45deg);
                    transform: rotateZ(45deg);
        }
        
        .sk-folding-cube .sk-cube {
            float: left;
            width: 50%;
            height: 50%;
            position: relative;
            -webkit-transform: scale(1.1);
                -ms-transform: scale(1.1);
                    transform: scale(1.1); 
        }
        .sk-folding-cube .sk-cube:before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #333;
            -webkit-animation: sk-foldCubeAngle 2.4s infinite linear both;
                    animation: sk-foldCubeAngle 2.4s infinite linear both;
            -webkit-transform-origin: 100% 100%;
                -ms-transform-origin: 100% 100%;
                    transform-origin: 100% 100%;
        }
        .sk-folding-cube .sk-cube2 {
            -webkit-transform: scale(1.1) rotateZ(90deg);
                    transform: scale(1.1) rotateZ(90deg);
        }
        .sk-folding-cube .sk-cube3 {
            -webkit-transform: scale(1.1) rotateZ(180deg);
                    transform: scale(1.1) rotateZ(180deg);
        }
        .sk-folding-cube .sk-cube4 {
            -webkit-transform: scale(1.1) rotateZ(270deg);
                    transform: scale(1.1) rotateZ(270deg);
        }
        .sk-folding-cube .sk-cube2:before {
            -webkit-animation-delay: 0.3s;
                    animation-delay: 0.3s;
        }
        .sk-folding-cube .sk-cube3:before {
            -webkit-animation-delay: 0.6s;
                    animation-delay: 0.6s; 
        }
        .sk-folding-cube .sk-cube4:before {
            -webkit-animation-delay: 0.9s;
                    animation-delay: 0.9s;
        }
        @-webkit-keyframes sk-foldCubeAngle {
            0%, 10% {
            -webkit-transform: perspective(140px) rotateX(-180deg);
                    transform: perspective(140px) rotateX(-180deg);
            opacity: 0; 
            } 25%, 75% {
            -webkit-transform: perspective(140px) rotateX(0deg);
                    transform: perspective(140px) rotateX(0deg);
            opacity: 1; 
            } 90%, 100% {
            -webkit-transform: perspective(140px) rotateY(180deg);
                    transform: perspective(140px) rotateY(180deg);
            opacity: 0; 
            } 
        }
        
        @keyframes sk-foldCubeAngle {
            0%, 10% {
            -webkit-transform: perspective(140px) rotateX(-180deg);
                    transform: perspective(140px) rotateX(-180deg);
            opacity: 0; 
            } 25%, 75% {
            -webkit-transform: perspective(140px) rotateX(0deg);
                    transform: perspective(140px) rotateX(0deg);
            opacity: 1; 
            } 90%, 100% {
            -webkit-transform: perspective(140px) rotateY(180deg);
                    transform: perspective(140px) rotateY(180deg);
            opacity: 0; 
            }
        }

        .loading-div-extension{
            position: fixed;
            z-index: 999999999;
            background-color: white;
            width: 100vw;
            height: 100vh;
            display:flex;
            align-items:center;
            justify-content:center
        }

        .loading-div-extension .sk-folding-cube{
            transform:scale(5)
        }
        </style>
    </div>
    `;
    hidePage();
    let result=document.querySelector(".result-container");
    if(result)
    {
        result.style.display="none";
    }
    document.querySelector("body").parentNode.insertBefore(createElementFromHTML(html), document.querySelector("body"));
    loadingTimeout=setTimeout(checkLoading, 200);
}

let loadingTimeout=null;
function checkLoading(){
    if(!loading)
    {
        let result=document.querySelector(".result-container");
        if(result)
        {
            result.style.display="block";
        }
        let loadingHTML=document.querySelector(".loading-div-extension");
        if(loadingHTML)
        {
            loadingHTML.remove();
        }
        clearTimeout(checkLoading)
    }
    else{
        loadingTimeout=setTimeout(checkLoading, 500);
    }
}

function generateQAHTML(results){
    let html="<div class='result-container'><div class='close-results'>X</div>";
    
    html+="<div class='approved qatest'><h1>Results</h1><ul>";
    results.forEach(result => {
        html+=`
        <li class='${result.result?'green':'orange'}'>
            <span class='test-name'><b>${result.field}</b></span><br><br>
            <span class='expected'><b>Expected value: </b><br>${result.expected}</span><br><br>
            <span class='value'><b>Found value: </b><br>${result.value}</span>
        </li>`
    });
    html+="</ul></div><style class='result-style'>"+style+"</style>";
    hidePage();
    document.querySelector("body").parentNode.insertBefore(createElementFromHTML(html), document.querySelector("body"));
    bindWhitelistEvent();
}

function generateFrequentHTML(results){
    let html=`
    <div class='result-container'>
        <div class='close-results'>X</div>
        <div class='approved qatest' style="margin-left:10px">
            <h1>World server project upload template</h1>
            <br>
            <pre>
Project is uploaded to WS.
Project Number: 
Project Name: INT_Product_or_Campaign_SubPage_Note_Date
Translation Word Count: 
Translation Due: XX/XX xx:xx
Validation Word Count: 
Validation Due: XX/XX xx:xx
            </pre>
            <br>
            <h1>ISV ready template</h1>
            <br>
            <pre>
Ready for ISV.
Project name:  
Word Count: 59
Page Count: 1
Edits due: 
Sign off due: 
Url (Branch): https://ic09.apple.com/tr/smart-keyboard/
            </pre>
            <br>
            <h1>Merge list template</h1>
            <br>
            <pre>
Merge list for --project-name-here--
Revisions:
Files modified:
            </pre>
            <br>
            <h1>DM QA test email list</h1>
            <br>
            <pre>
cakcay@apple.com, qahogarthtr@yahoo.com, qa.hogarthww.tr@gmail.com, qa.hogarthww.tr@hotmail.com
            </pre>
            <br>
            <h1>SVN File access rights in case of forbidden error</h1>
            <br>
            <pre>
chmod 0777 *
            </pre>
            <br>
            <h1>SVN log by user</h1>
            <br>
            <pre>
svn log -r {2017-01-01}:{2017-01-01} --search kcakar
            </pre>
            <br>
            <h1>DM QA test email list</h1>
            <br>
            <pre>
cakcay@apple.com, qahogarthtr@yahoo.com, qa.hogarthww.tr@gmail.com, qa.hogarthww.tr@hotmail.com
            </pre>
            <br>
            <h1>DM localisation and mockup data menus</h1>
            <br>
            <pre>
Localization->text
User Management->Test Lists->Mock data(dropdown on top)
<br>
<h1>BASH rc içeriği (' . ~/.bashrc' komutuyla aktifleniyor)</h1>

alias o='open .'
alias sup='svn up --set-depth infinity'
alias supim='svn up --set-depth immediates'
alias supdim='svn up --depth immediates'
alias trwebedit='cd /Users/keremcancakar/Development/applecom/turkey/branches/webedit && echo "current folder:" && pwd'
alias trtrunk='cd /Users/keremcancakar/Development/applecom/turkey/trunk && echo "current folder:" && pwd'
alias tric01='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic01 && echo "current folder:" && pwd'
alias tric02='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic02 && echo "current folder:" && pwd'
alias tric03='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic03 && echo "current folder:" && pwd'
alias tric04='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic04 && echo "current folder:" && pwd'
alias tric05='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic05 && echo "current folder:" && pwd'
alias tric06='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic06 && echo "current folder:" && pwd'
alias tric07='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic07 && echo "current folder:" && pwd'
alias tric08='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic08 && echo "current folder:" && pwd'
alias tric09='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic09 && echo "current folder:" && pwd'
alias tric10='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic10 && echo "current folder:" && pwd'
alias tric11='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic11 && echo "current folder:" && pwd'
alias tric12='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic12 && echo "current folder:" && pwd'
alias tric13='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic13 && echo "current folder:" && pwd'
alias tric14='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic14 && echo "current folder:" && pwd'
alias tric15='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic15 && echo "current folder:" && pwd'
alias tric16='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic16 && echo "current folder:" && pwd'
alias tric17='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic17 && echo "current folder:" && pwd'
alias tric18='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic18 && echo "current folder:" && pwd'
alias tric19='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic19 && echo "current folder:" && pwd'
alias tric20='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic20 && echo "current folder:" && pwd'
alias tric21='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic21 && echo "current folder:" && pwd'
alias tric22='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic22 && echo "current folder:" && pwd'
alias tric23='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic23 && echo "current folder:" && pwd'
alias tric24='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic24 && echo "current folder:" && pwd'
alias tric25='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic25 && echo "current folder:" && pwd'
alias tric26='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic26 && echo "current folder:" && pwd'
alias tric27='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic27 && echo "current folder:" && pwd'
alias tric28='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic28 && echo "current folder:" && pwd'
alias tric29='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic29 && echo "current folder:" && pwd'
alias tric30='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic30 && echo "current folder:" && pwd'
alias tric31='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic31 && echo "current folder:" && pwd'
alias tric32='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic32 && echo "current folder:" && pwd'
alias tric33='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic33 && echo "current folder:" && pwd'
alias tric34='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic34 && echo "current folder:" && pwd'
alias tric35='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic35 && echo "current folder:" && pwd'
alias tric36='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic36 && echo "current folder:" && pwd'
alias tric37='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic37 && echo "current folder:" && pwd'
alias tric38='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic38 && echo "current folder:" && pwd'
alias tric39='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic39 && echo "current folder:" && pwd'
alias tric40='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic40 && echo "current folder:" && pwd'
alias tric41='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic41 && echo "current folder:" && pwd'
alias tric42='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic42 && echo "current folder:" && pwd'
alias tric43='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic43 && echo "current folder:" && pwd'
alias tric44='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic44 && echo "current folder:" && pwd'
alias tric45='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic45 && echo "current folder:" && pwd'
alias tric46='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic46 && echo "current folder:" && pwd'
alias tric47='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic47 && echo "current folder:" && pwd'
alias tric48='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic48 && echo "current folder:" && pwd'
alias tric49='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic49 && echo "current folder:" && pwd'
alias tric50='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic50 && echo "current folder:" && pwd'
alias tric51='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic51 && echo "current folder:" && pwd'
alias tric52='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic52 && echo "current folder:" && pwd'
alias tric53='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic53 && echo "current folder:" && pwd'
alias tric54='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic54 && echo "current folder:" && pwd'
alias tric55='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic55 && echo "current folder:" && pwd'
alias tric56='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic56 && echo "current folder:" && pwd'
alias tric57='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic57 && echo "current folder:" && pwd'
alias tric58='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic58 && echo "current folder:" && pwd'
alias tric59='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic59 && echo "current folder:" && pwd'
alias tric60='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic60 && echo "current folder:" && pwd'
alias tric61='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic61 && echo "current folder:" && pwd'
alias tric62='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic62 && echo "current folder:" && pwd'
alias tric63='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic63 && echo "current folder:" && pwd'
alias tric64='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic64 && echo "current folder:" && pwd'
alias tric65='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic65 && echo "current folder:" && pwd'
alias tric66='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic66 && echo "current folder:" && pwd'
alias tric67='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic67 && echo "current folder:" && pwd'
alias tric68='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic68 && echo "current folder:" && pwd'
alias tric69='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic69 && echo "current folder:" && pwd'
alias tric70='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic70 && echo "current folder:" && pwd'
alias tric71='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic71 && echo "current folder:" && pwd'
alias tric72='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic72 && echo "current folder:" && pwd'
alias tric73='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic73 && echo "current folder:" && pwd'
alias tric74='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic74 && echo "current folder:" && pwd'
alias tric75='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic75 && echo "current folder:" && pwd'
alias tric76='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic76 && echo "current folder:" && pwd'
alias tric77='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic77 && echo "current folder:" && pwd'
alias tric78='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic78 && echo "current folder:" && pwd'
alias tric79='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic79 && echo "current folder:" && pwd'
alias tric80='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic80 && echo "current folder:" && pwd'
alias tric81='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic81 && echo "current folder:" && pwd'
alias tric82='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic82 && echo "current folder:" && pwd'
alias tric83='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic83 && echo "current folder:" && pwd'
alias tric84='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic84 && echo "current folder:" && pwd'
alias tric85='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic85 && echo "current folder:" && pwd'
alias tric86='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic86 && echo "current folder:" && pwd'
alias tric87='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic87 && echo "current folder:" && pwd'
alias tric88='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic88 && echo "current folder:" && pwd'
alias tric89='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic89 && echo "current folder:" && pwd'
alias tric90='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic90 && echo "current folder:" && pwd'
alias tric91='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic91 && echo "current folder:" && pwd'
alias tric92='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic92 && echo "current folder:" && pwd'
alias tric93='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic93 && echo "current folder:" && pwd'
alias tric94='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic94 && echo "current folder:" && pwd'
alias tric95='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic95 && echo "current folder:" && pwd'
alias tric96='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic96 && echo "current folder:" && pwd'
alias tric97='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic97 && echo "current folder:" && pwd'
alias tric98='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic98 && echo "current folder:" && pwd'
alias tric99='cd /Users/keremcancakar/Development/applecom/turkey/branches/ic99 && echo "current folder:" && pwd'
alias uswebedit='cd /Users/keremcancakar/Development/applecom/us/branches/webedit && echo "current folder:" && pwd'
alias usic01='cd /Users/keremcancakar/Development/applecom/us/branches/ic01 && echo "current folder:" && pwd'
alias usic02='cd /Users/keremcancakar/Development/applecom/us/branches/ic02 && echo "current folder:" && pwd'
alias usic03='cd /Users/keremcancakar/Development/applecom/us/branches/ic03 && echo "current folder:" && pwd'
alias usic04='cd /Users/keremcancakar/Development/applecom/us/branches/ic04 && echo "current folder:" && pwd'
alias usic05='cd /Users/keremcancakar/Development/applecom/us/branches/ic05 && echo "current folder:" && pwd'
alias usic06='cd /Users/keremcancakar/Development/applecom/us/branches/ic06 && echo "current folder:" && pwd'
alias usic07='cd /Users/keremcancakar/Development/applecom/us/branches/ic07 && echo "current folder:" && pwd'
alias usic08='cd /Users/keremcancakar/Development/applecom/us/branches/ic08 && echo "current folder:" && pwd'
alias usic09='cd /Users/keremcancakar/Development/applecom/us/branches/ic09 && echo "current folder:" && pwd'
alias usic10='cd /Users/keremcancakar/Development/applecom/us/branches/ic10 && echo "current folder:" && pwd'
alias usic11='cd /Users/keremcancakar/Development/applecom/us/branches/ic11 && echo "current folder:" && pwd'
alias usic12='cd /Users/keremcancakar/Development/applecom/us/branches/ic12 && echo "current folder:" && pwd'
alias usic13='cd /Users/keremcancakar/Development/applecom/us/branches/ic13 && echo "current folder:" && pwd'
alias usic14='cd /Users/keremcancakar/Development/applecom/us/branches/ic14 && echo "current folder:" && pwd'
alias usic15='cd /Users/keremcancakar/Development/applecom/us/branches/ic15 && echo "current folder:" && pwd'
alias usic16='cd /Users/keremcancakar/Development/applecom/us/branches/ic16 && echo "current folder:" && pwd'
alias usic17='cd /Users/keremcancakar/Development/applecom/us/branches/ic17 && echo "current folder:" && pwd'
alias usic18='cd /Users/keremcancakar/Development/applecom/us/branches/ic18 && echo "current folder:" && pwd'
alias usic19='cd /Users/keremcancakar/Development/applecom/us/branches/ic19 && echo "current folder:" && pwd'
alias usic20='cd /Users/keremcancakar/Development/applecom/us/branches/ic20 && echo "current folder:" && pwd'
alias usic21='cd /Users/keremcancakar/Development/applecom/us/branches/ic21 && echo "current folder:" && pwd'
alias usic22='cd /Users/keremcancakar/Development/applecom/us/branches/ic22 && echo "current folder:" && pwd'
alias usic23='cd /Users/keremcancakar/Development/applecom/us/branches/ic23 && echo "current folder:" && pwd'
alias usic24='cd /Users/keremcancakar/Development/applecom/us/branches/ic24 && echo "current folder:" && pwd'
alias usic25='cd /Users/keremcancakar/Development/applecom/us/branches/ic25 && echo "current folder:" && pwd'
alias usic26='cd /Users/keremcancakar/Development/applecom/us/branches/ic26 && echo "current folder:" && pwd'
alias usic27='cd /Users/keremcancakar/Development/applecom/us/branches/ic27 && echo "current folder:" && pwd'
alias usic28='cd /Users/keremcancakar/Development/applecom/us/branches/ic28 && echo "current folder:" && pwd'
alias usic29='cd /Users/keremcancakar/Development/applecom/us/branches/ic29 && echo "current folder:" && pwd'
alias usic30='cd /Users/keremcancakar/Development/applecom/us/branches/ic30 && echo "current folder:" && pwd'
alias usic31='cd /Users/keremcancakar/Development/applecom/us/branches/ic31 && echo "current folder:" && pwd'
alias usic32='cd /Users/keremcancakar/Development/applecom/us/branches/ic32 && echo "current folder:" && pwd'
alias usic33='cd /Users/keremcancakar/Development/applecom/us/branches/ic33 && echo "current folder:" && pwd'
alias usic34='cd /Users/keremcancakar/Development/applecom/us/branches/ic34 && echo "current folder:" && pwd'
alias usic35='cd /Users/keremcancakar/Development/applecom/us/branches/ic35 && echo "current folder:" && pwd'
alias usic36='cd /Users/keremcancakar/Development/applecom/us/branches/ic36 && echo "current folder:" && pwd'
alias usic37='cd /Users/keremcancakar/Development/applecom/us/branches/ic37 && echo "current folder:" && pwd'
alias usic38='cd /Users/keremcancakar/Development/applecom/us/branches/ic38 && echo "current folder:" && pwd'
alias usic39='cd /Users/keremcancakar/Development/applecom/us/branches/ic39 && echo "current folder:" && pwd'
alias usic40='cd /Users/keremcancakar/Development/applecom/us/branches/ic40 && echo "current folder:" && pwd'
alias usic41='cd /Users/keremcancakar/Development/applecom/us/branches/ic41 && echo "current folder:" && pwd'
alias usic42='cd /Users/keremcancakar/Development/applecom/us/branches/ic42 && echo "current folder:" && pwd'
alias usic43='cd /Users/keremcancakar/Development/applecom/us/branches/ic43 && echo "current folder:" && pwd'
alias usic44='cd /Users/keremcancakar/Development/applecom/us/branches/ic44 && echo "current folder:" && pwd'
alias usic45='cd /Users/keremcancakar/Development/applecom/us/branches/ic45 && echo "current folder:" && pwd'
alias usic46='cd /Users/keremcancakar/Development/applecom/us/branches/ic46 && echo "current folder:" && pwd'
alias usic47='cd /Users/keremcancakar/Development/applecom/us/branches/ic47 && echo "current folder:" && pwd'
alias usic48='cd /Users/keremcancakar/Development/applecom/us/branches/ic48 && echo "current folder:" && pwd'
alias usic49='cd /Users/keremcancakar/Development/applecom/us/branches/ic49 && echo "current folder:" && pwd'
alias usic50='cd /Users/keremcancakar/Development/applecom/us/branches/ic50 && echo "current folder:" && pwd'
alias usic51='cd /Users/keremcancakar/Development/applecom/us/branches/ic51 && echo "current folder:" && pwd'
alias usic52='cd /Users/keremcancakar/Development/applecom/us/branches/ic52 && echo "current folder:" && pwd'
alias usic53='cd /Users/keremcancakar/Development/applecom/us/branches/ic53 && echo "current folder:" && pwd'
alias usic54='cd /Users/keremcancakar/Development/applecom/us/branches/ic54 && echo "current folder:" && pwd'
alias usic55='cd /Users/keremcancakar/Development/applecom/us/branches/ic55 && echo "current folder:" && pwd'
alias usic56='cd /Users/keremcancakar/Development/applecom/us/branches/ic56 && echo "current folder:" && pwd'
alias usic57='cd /Users/keremcancakar/Development/applecom/us/branches/ic57 && echo "current folder:" && pwd'
alias usic58='cd /Users/keremcancakar/Development/applecom/us/branches/ic58 && echo "current folder:" && pwd'
alias usic59='cd /Users/keremcancakar/Development/applecom/us/branches/ic59 && echo "current folder:" && pwd'
alias usic60='cd /Users/keremcancakar/Development/applecom/us/branches/ic60 && echo "current folder:" && pwd'
alias usic61='cd /Users/keremcancakar/Development/applecom/us/branches/ic61 && echo "current folder:" && pwd'
alias usic62='cd /Users/keremcancakar/Development/applecom/us/branches/ic62 && echo "current folder:" && pwd'
alias usic63='cd /Users/keremcancakar/Development/applecom/us/branches/ic63 && echo "current folder:" && pwd'
alias usic64='cd /Users/keremcancakar/Development/applecom/us/branches/ic64 && echo "current folder:" && pwd'
alias usic65='cd /Users/keremcancakar/Development/applecom/us/branches/ic65 && echo "current folder:" && pwd'
alias usic66='cd /Users/keremcancakar/Development/applecom/us/branches/ic66 && echo "current folder:" && pwd'
alias usic67='cd /Users/keremcancakar/Development/applecom/us/branches/ic67 && echo "current folder:" && pwd'
alias usic68='cd /Users/keremcancakar/Development/applecom/us/branches/ic68 && echo "current folder:" && pwd'
alias usic69='cd /Users/keremcancakar/Development/applecom/us/branches/ic69 && echo "current folder:" && pwd'
alias usic70='cd /Users/keremcancakar/Development/applecom/us/branches/ic70 && echo "current folder:" && pwd'
alias usic71='cd /Users/keremcancakar/Development/applecom/us/branches/ic71 && echo "current folder:" && pwd'
alias usic72='cd /Users/keremcancakar/Development/applecom/us/branches/ic72 && echo "current folder:" && pwd'
alias usic73='cd /Users/keremcancakar/Development/applecom/us/branches/ic73 && echo "current folder:" && pwd'
alias usic74='cd /Users/keremcancakar/Development/applecom/us/branches/ic74 && echo "current folder:" && pwd'
alias usic75='cd /Users/keremcancakar/Development/applecom/us/branches/ic75 && echo "current folder:" && pwd'
alias usic76='cd /Users/keremcancakar/Development/applecom/us/branches/ic76 && echo "current folder:" && pwd'
alias usic77='cd /Users/keremcancakar/Development/applecom/us/branches/ic77 && echo "current folder:" && pwd'
alias usic78='cd /Users/keremcancakar/Development/applecom/us/branches/ic78 && echo "current folder:" && pwd'
alias usic79='cd /Users/keremcancakar/Development/applecom/us/branches/ic79 && echo "current folder:" && pwd'
alias usic80='cd /Users/keremcancakar/Development/applecom/us/branches/ic80 && echo "current folder:" && pwd'
alias usic81='cd /Users/keremcancakar/Development/applecom/us/branches/ic81 && echo "current folder:" && pwd'
alias usic82='cd /Users/keremcancakar/Development/applecom/us/branches/ic82 && echo "current folder:" && pwd'
alias usic83='cd /Users/keremcancakar/Development/applecom/us/branches/ic83 && echo "current folder:" && pwd'
alias usic84='cd /Users/keremcancakar/Development/applecom/us/branches/ic84 && echo "current folder:" && pwd'
alias usic85='cd /Users/keremcancakar/Development/applecom/us/branches/ic85 && echo "current folder:" && pwd'
alias usic86='cd /Users/keremcancakar/Development/applecom/us/branches/ic86 && echo "current folder:" && pwd'
alias usic87='cd /Users/keremcancakar/Development/applecom/us/branches/ic87 && echo "current folder:" && pwd'
alias usic88='cd /Users/keremcancakar/Development/applecom/us/branches/ic88 && echo "current folder:" && pwd'
alias usic89='cd /Users/keremcancakar/Development/applecom/us/branches/ic89 && echo "current folder:" && pwd'
alias usic90='cd /Users/keremcancakar/Development/applecom/us/branches/ic90 && echo "current folder:" && pwd'
alias usic91='cd /Users/keremcancakar/Development/applecom/us/branches/ic91 && echo "current folder:" && pwd'
alias usic92='cd /Users/keremcancakar/Development/applecom/us/branches/ic92 && echo "current folder:" && pwd'
alias usic93='cd /Users/keremcancakar/Development/applecom/us/branches/ic93 && echo "current folder:" && pwd'
alias usic94='cd /Users/keremcancakar/Development/applecom/us/branches/ic94 && echo "current folder:" && pwd'
alias usic95='cd /Users/keremcancakar/Development/applecom/us/branches/ic95 && echo "current folder:" && pwd'
alias usic96='cd /Users/keremcancakar/Development/applecom/us/branches/ic96 && echo "current folder:" && pwd'
alias usic97='cd /Users/keremcancakar/Development/applecom/us/branches/ic97 && echo "current folder:" && pwd'
alias usic98='cd /Users/keremcancakar/Development/applecom/us/branches/ic98 && echo "current folder:" && pwd'
alias usic99='cd /Users/keremcancakar/Development/applecom/us/branches/ic99 && echo "current folder:" && pwd'
alias ustrunk='cd /Users/keremcancakar/Development/applecom/us/trunk/ && echo "current folder:" && pwd'
            </pre>
        </div>
        <style class='result-style'>${style}</style>
    `;
    hidePage();
    document.querySelector("body").parentNode.insertBefore(createElementFromHTML(html), document.querySelector("body"));
    bindWhitelistEvent();
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
  
    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild; 
  }

let pageChildren=[];
let pageChildrenBackup=[];
function hidePage(){
    document.querySelector("body").style.display="none";
}

function showPage(){
    const oldHighlights=document.querySelectorAll(".aria-label-highlight");
    oldHighlights.forEach(element=>{
        element.classList.remove("aria-label-highlight");
    })

    const viewers=document.querySelectorAll(".aria-label-viewer");
    viewers.forEach(element=>{
        element.remove();
    });

    for(let i=0;i<13;i++)
    {
        let elements=document.querySelectorAll(".viewer-color-"+i);
        elements.forEach(element=>{
            element.classList.remove("viewer-color-"+i);
        });
    }

    document.querySelector("body").style.display="block";
    let result=document.querySelector(".result-container");
    let resultPopup=document.querySelector(".result-container-popup");
    let label=document.querySelector(".aria-label-viewer");
    let analytics=document.querySelector(".analytics-viewer");
    if(result){
        result.remove();
    }
    if(resultPopup){
        resultPopup.remove();
    }
    if(label){
        label.remove();
    }
    if(analytics){
        analytics.remove();
    }
}

function compare(a,b) {
    if (a.result < b.result)
      return -1;
    if (a.result > b.result)
      return 1;
    return 0;
  }




function checkPageTitleOgTitle(){
    let title=document.querySelector("title").innerHTML;
    let ogTitle=document.querySelector("[property='og:title']").getAttribute("content");

    if(ogTitle+" - Apple (TR)"===title)
    {
        return {field:"Title - OG:title comparison",expected:"Title should be og:title+' - Apple (TR)' <br> "+ogTitle+" - Apple (TR)",result:true,value:"<br>og:title:<br>"+ogTitle+"<br><br>title:<br>"+title};
    }
    else{
        return {field:"Title - OG:title comparison",expected:"Title should be og:title+' - Apple (TR)' <br> "+ogTitle+" - Apple (TR)",result:false,value:"<br>og:title:<br>"+ogTitle+"<br><br>title:<br>"+title};
    }
}

function checkOgURL(){
    
    let ogURL=document.querySelector("[property='og:url']").getAttribute("content")
    if(ogURL.indexOf(locale_variable)!==-1)
    {
        return {field:"OG:url",expected:"To be localised",result:true,value:ogURL};
    }
    else{
        return {field:"OG:url",expected:"To be localised",result:false,value:ogURL};
    }
}

function checkOgSiteName(){
    
    let siteName=document.querySelector("[property='og:site_name']").getAttribute("content");
    if(siteName===sitename_variable)
    {
        return {field:"OG:sitename",expected:sitename_variable,result:true,value:siteName};
    }
    else{
        return {field:"OG:sitename",expected:sitename_variable,result:false,value:siteName};
    }
}

function checkMetaDescEqualsOGDesc(){
    let metaDesc=document.querySelector("meta[name='Description']");
    if(!metaDesc){
        metaDesc=document.querySelector("meta[name='description']");
    }
    metaDesc=metaDesc.content;
    let ogDesc=document.querySelector("[property='og:description']").getAttribute("content");

    if(ogDesc===metaDesc)
    {
        return {field:"Meta description equals to og:description",expected:"Content to be the same",result:true,value:"<br>og:description:'"+ogDesc+"'<br><br>meta description:'"+metaDesc+"'"};
    }
    else{
        return {field:"Meta description equals to og:description",expected:"Content to be the same",result:false,value:"<br>og:description:'"+ogDesc+"'<br><br>meta description:'"+metaDesc};
    }
}

function checkMetaDescLength(){
    let metaDesc=document.querySelector("meta[name='Description']");
    if(!metaDesc){
        metaDesc=document.querySelector("meta[name='description']");
    }
    let descLength=metaDesc.content.length;
    if(descLength<140)
    {
        return {field:"Meta description length",expected:"Less than 140 characters",result:true,value:descLength};
    }
    else{
        return {field:"Meta description length",expected:"Less than 140 characters",result:false,value:descLength};
    }
}

function checkOgDescLength(){
    let descLength=document.querySelector("[property='og:description']").getAttribute("content").length;
    if( descLength<140)
    {
        return {field:"OG description length",expected:"Less than 140 characters",result:true,value:descLength};
    }
    else{
        return {field:"OG description length",expected:"Less than 140 characters",result:false,value:descLength};
    }
}

function checkFooterLang(){
    let footerLang=document.querySelector("footer").getAttribute("lang");
    if(footerLang===page_lang_variable)
    {
        return {field:"Footer lang attribute",expected:page_lang_variable,result:true,value:footerLang};
    }
    else{
        return {field:"Footer lang attribute",expected:page_lang_variable,result:false,value:footerLang};
    }
}

function checkHtmlXmlLang(){
    let htmlXmlLang=document.querySelector("html").getAttribute("xml:lang");
    if(htmlXmlLang===page_lang_variable)
    {
        return {field:"Html xml:lang attribute",expected:page_lang_variable,result:true,value:htmlXmlLang};
    }
    else{
        return {field:"Html xml:lang attribute",expected:page_lang_variable,result:false,value:htmlXmlLang};
    }
}

function checkHtmlLang(){
    let htmlLang=document.querySelector("html").getAttribute("lang");
    if(htmlLang===page_lang_variable)
    {
        return {field:"Html lang attribute",expected:page_lang_variable,result:true,value:htmlLang};
    }
    else{
        return {field:"Html lang attribute",expected:page_lang_variable,result:false,value:htmlLang};
    }
}

function checkOGLocale()
{
    let element=document.querySelector("[property='og:locale']");
    if(element)
    {
        let oglocale=document.querySelector("[property='og:locale']").content;

        if(oglocale===page_locale_variable)
        {
            return {field:"og:locale",expected:page_locale_variable,result:true,value:oglocale};
        }
        else{
            return {field:"og:locale",expected:page_locale_variable,result:false,value:oglocale};
        }
    }
    else{
        return {field:"og:locale",expected:page_locale_variable,result:false,value:oglocale};
    }

}

function generateAutoLinksHtml(){
    let html=`
    <div class='result-container'>
        <div class='close-results'>X</div>
        <div class='approved qatest'>
            <p style='margin-left: 15px; padding-top: 15px;'>Open US also?</p>
            <input type='checkbox' class='chkUS' type='text' style='margin-left: 15px;'>
            <p style='margin-left: 15px; padding-top: 15px;'>What is your branch? (www,www-stage-view,ic23,webedit-local etc)</p>
            <input class='txt-branch' type='text' style='margin-left: 15px;'>
            <p style='margin-left: 15px; padding-top: 15px;'>Paste your paths below</p>
            <textarea class='txt-auto-links' style='width:100%;max-width: 500px; min-height: 500px;  margin: 15px;' ></textarea><br>
            <button class='btn-auto-links' style='margin-left: 15px;'>Open all the links</button>
        </div>
        <style class='result-style'>${style}</style>
    `;
    hidePage();
    document.querySelector("body").parentNode.insertBefore(createElementFromHTML(html), document.querySelector("body"));
    bindWhitelistEvent();
}

function automaticallyOpenLinks(){
    let txtbox=document.querySelector(".txt-auto-links");
    let txtbranch=document.querySelector(".txt-branch");
    let isUS=document.querySelector(".chkUS").checked;

    
    if(txtbox)
    {
        chrome.runtime.sendMessage({type:'auto_link_open',urls:generateURLs(txtbox.value,txtbranch.value,isUS)});
    }
}

function generateURLs(value,branch,isUS){
    let urls=value.split("\n");
    let results=[];
    urls.map(url=>{
        if(url.length>1)
        {
            if(url.indexOf(locale_short_variable)!==-1)
            {
                url=url.replace(locale_variable,"/");
            }
            if(isUS)
            {
                results.push("http://"+branch+".apple.com"+url);
            }
            results.push("http://"+branch+".apple.com"+locale_variable+url);
        }

    });
    return results;
}

function checkCssRules(rule)
{
    if(rule.style && rule.style.backgroundImage){
        let imageUrl=rule.style.backgroundImage;
        if(imageUrl.indexOf("initial")===-1)
        {
            imageUrl=imageUrl.replace('url("',"").replace('")',"");
        
            if(imageUrl.indexOf("http")==-1)
            {
                imageUrl=window.location.origin+imageUrl;
            }
            cssCheckImages.push(imageUrl);
        }
    }

    //recursive check
    if(rule.cssRules)
    {
        Object.keys(rule.cssRules).forEach(altRuleKey=>{
            cssCheckImages.concat(checkCssRules(rule.cssRules[altRuleKey]));
        });
    }
}


function fillDimension(img)
{
    img.onload=function(){
        let target=img.src;

        if(target)
        {
            let targetElement=document.querySelector("[data-css-url='"+target+"']");
            if(targetElement)
            {
                let imageSizeSpan=document.querySelector("[data-css-url='"+target+"']")
                imageSizeSpan.innerHTML=img.naturalWidth+"x"+img.naturalHeight;
                imageSizeSpan.classList.add("dimension-ready");
                if(imageSizeSpan.parentElement.getElementsByClassName("dimension-ready").length>=2){
                    markDifferentDimensions(targetElement.parentElement);
                }
            }

        }
    }

    img.onerror=function(){
        let target=img.src;
        if(img.src)
        {
            if(!img.classList.contains("us-image"))
            {
                let html=`<li>Broken image link: ${img.src}</li>`
                let toAppend=document.querySelector(".css-error-list");
                if(toAppend)
                {
                    toAppend.appendChild(createElementFromHTML(html));
                }
            }
        }
        
    }
}

function markDifferentDimensions(parentElement){
    let sizeLocale=parentElement.getElementsByClassName("size-locale")[0].innerHTML;   
    let sizeUS=parentElement.getElementsByClassName("size-us")[0].innerHTML;   
    if(sizeLocale!==sizeUS){
        parentElement.classList.add("different-size");
    }
}

let cssCheckImages=[];
function generateCssCheckHtml(){
    let possible="";

    Object.keys(window.document.styleSheets).forEach(key=>{
        if(window.document.styleSheets[key].href.indexOf(locale_variable)!==-1)
        {
            Object.keys(window.document.styleSheets[key].cssRules).forEach(ruleKey=>{
                let rule=window.document.styleSheets[key].cssRules[ruleKey];
                checkCssRules(rule);
            });
        }
    });

    let localisedImages=[];
    let notLocalised=[];
    cssCheckImages.forEach(image=>{
        if(image.indexOf(locale_variable)===-1)
        {
            notLocalised.push(image);
        }
        else{
            localisedImages.push(image);
        }
    });

    let notLocalisedHtml="";

    findUSVersions();

    notLocalised.forEach(image=>{
        let usImageUrl="";
        cssCheckUSImages.forEach(usImage=>{
            let split=usImage.split("/");
            let usImageName=split[split.length-1];

            if(image.indexOf(usImageName)!==-1)
            {
                usImageUrl=usImage;
            }
        });

        
        notLocalisedHtml+=`
            <li class='orange cssCheck' style='max-width:550px' data-css-find-attr='${image}${usImageUrl}'>
                <span class='css-image-size size-locale' data-css-url='${image}'></span>
                <span style='color:red;font-size:20px;font-weight: bold;'>
                    <a target="_blank" href='${image}'>${image}</a>
                </span>
                <span class='css-image-size size-us' data-css-url='${usImageUrl}'></span>
                <span style='color:red;font-size:20px;font-weight: bold;'>
                    <a target="_blank" href='${usImageUrl}'>${usImageUrl}</a>
                </span>
                <div style='css-image-comparison'>
                    <button class='compareImages' data-tr-image="${image}" data-us-image="${usImageUrl})" style='border:1px solid black;border-radius:5px;'>Compare Images</button><br><br>
                    <img class='css-auto-dimension' style='max-width:500px' src='${image}' >
                    <img class='css-auto-dimension us-image' style='max-width:500px' src='${usImageUrl}'>
                    <div data-target='${image}${usImageUrl}' style='display:none;max-width:500px'></div>
                </div>
            </li>
        `;
    })

    let localisedHtml="";
    localisedImages.forEach(image=>{

        let usImageUrl="";
        cssCheckUSImages.forEach(usImage=>{
            let split=usImage.split("/");
            let usImageName=split[split.length-1];

            if(image.indexOf(usImageName)!==-1)
            {
                usImageUrl=usImage;
            }
        });

        localisedHtml+=`
            <li class="green cssCheck" style='max-width:100vw' data-css-find-attr='${image}${usImageUrl}'>
                <span class='css-image-size size-locale' data-css-url='${image}'></span>
                <span style='color:green;font-size:20px;font-weight: bold;'>
                    <a target="_blank" href='${image}'>${image}</a>
                </span>
                <span class='css-image-size size-us' data-css-url='${usImageUrl}'></span>
                <span style='color:green;font-size:20px;font-weight: bold;'>
                    <a target="_blank" href='${usImageUrl}'>${usImageUrl}</a>
                </span>
                <br>
                <div style='css-image-comparison'>
                    <img class='css-auto-dimension' style='max-width:500px' style='float:left' src='${image}'>
                    <img class='css-auto-dimension us-image' style='max-width:500px' style='float:left' src='${usImageUrl}'>
                    <br>
                    <button class='compareImages' data-tr-image="${image}" data-us-image="${usImageUrl}" style='border: 1px solid black; padding: 5px; border-radius: 5px; margin-top: 10px;'>Compare Images</button><br><br>
                    <div data-target='${image}${usImageUrl}' style='display:none;max-width:500px'></div>
                </div>
            </li>
        `;
    })

    let checkedLinks="";
    Object.keys(window.document.styleSheets).forEach(key=>{
        if(window.document.styleSheets[key].href.indexOf(locale_variable)!==-1)
        {
            checkedLinks+="<p>"+window.document.styleSheets[key].href+"</p>";
        }
    });



    let html=`
    <div class='result-container'>
        <div class='close-results'>X</div>
        <div class='approved qatest'>
            <p style='margin-left: 15px; padding-top: 15px;font-size:20px'>A total of <span style="font-weight:bold">${cssCheckImages.length}</span> images has been found in the localised css file.<br><span style="font-weight:bold;color:darkgreen">${localisedImages.length}</span> of images are localised while <span style="font-weight:bold;color:darkred">${notLocalised.length}</span> of images are not.</p><br>
            <span style='margin-left: 15px; padding-top: 15px;margin-right:15px'>Filter images by name</span>
            <input id='filter-images-css-check' type='text' style='margin-right:20px'/><br>
            <input type="checkbox" id="dimension-filter"> Show dimension diffrences only.
            <span class='css-check-filtered-count' style='color:darkgreen'></span><br>
            <p style='margin-left: 15px; padding-top: 15px;'>Checked css links:</p>
            <ul>
                ${checkedLinks}
            </ul>
            <br>
            <ul class='css-error-list'>
            </ul>
            <ul>
                ${notLocalisedHtml}
                ${localisedHtml}
            </ul>
        </div>
        <style class='result-style'>${style}</style>
    `;

    hidePage();
    document.querySelector("body").parentNode.insertBefore(createElementFromHTML(html), document.querySelector("body"));
    bindWhitelistEvent();
    

}

function compareImages(e){
    let tr=e.target.attributes["data-tr-image"].value;
    let us=e.target.attributes["data-us-image"].value;
    addLoadingHTML();
    loading=true;
    loadingTimeout=setTimeout(checkLoading, 250);
    resemble(tr).compareTo(us).ignoreLess().outputSettings({
        transparency: 1,
        errorType: 'diffOnly'
    }).ignoreAntialiasing().repaint().onComplete(function(data){
        loading=false;
        var diffImage = new Image();
        if(data.error){

            alert("Cannot find US image");
            return;
        }
        diffImage.src = data.getImageDataUrl();
        let imageHTML=diffImage;
        imageHTML.style.maxWidth="100vw";
        imageHTML.style.border="1px solid darkred"
        
        document.querySelector("[data-target='"+tr+us+"']").appendChild(imageHTML);
        document.querySelector("[data-target='"+tr+us+"']").style.display="block";
    })
}

function filterImagesByName(){
    let count=0;
    if(this.value.length===0)
    {
        document.querySelectorAll("li.cssCheck").forEach(element=>{
            element.style.display="block";
        });
        document.querySelector(".css-check-filtered-count").innerHTML="";
        return;
    }
    else{
        document.querySelectorAll("li.cssCheck").forEach(element=>{
            let sign=element.attributes["data-css-find-attr"];
            if(sign && (sign.value.indexOf(this.value)===-1))
            {
                element.style.display="none";
            }
            else{
                count++;
                element.style.display="block";
            }
        });
    }   
    document.querySelector(".css-check-filtered-count").innerHTML=count+" images found.";
    if(count==0)
    {
        document.querySelector(".css-check-filtered-count").innerHTML="No images found.";
    }
}

let imageNameList=[];
function findUSVersions(){
    cssCheckImages.forEach(image=>{
        let split=image.split("/");
        let imageName=split[split.length-1];
        imageNameList.push(imageName);
    });
    Object.keys(window.document.styleSheets).forEach(key=>{
        if(window.document.styleSheets[key].href.indexOf(locale_variable)===-1)
        {
            Object.keys(window.document.styleSheets[key].cssRules).forEach(ruleKey=>{
                let rule=window.document.styleSheets[key].cssRules[ruleKey];
                findCssUsImages(rule);
            });
        }
    });
}

let cssCheckUSImages=[];
function findCssUsImages(rule){
    if(rule.style && rule.style.backgroundImage){
        let imageUrl=rule.style.backgroundImage;
        imageUrl=imageUrl.replace('url("',"").replace('")',"");
        
        if(imageUrl.indexOf("http")==-1)
        {
            imageUrl=window.location.origin+imageUrl;
        }

        let found=false;
        imageNameList.forEach(imageName=>{
            if(imageUrl.indexOf(imageName)!==-1)
            {
                cssCheckUSImages.push(imageUrl);
            }
        })
    }

    //recursive check
    if(rule.cssRules)
    {
        Object.keys(rule.cssRules).forEach(altRuleKey=>{
            cssCheckUSImages.concat(findCssUsImages(rule.cssRules[altRuleKey]));
        });
    }
}


//general html&css
const style=`
.result-container{
    z-index:9999;
    position:relative;
}
.result-container .qatest li{
    padding-left:10px;
}
.result-container .suspicious li {
    height: 45px;
    background: #F7F5F2
}

.result-container .suspicious li button {
    margin: 0px 10px;
}

.result-container .suspicious li button:hover {
    background-color: #b1efa6
}

.result-container .suspicious .comment {
    color: darkred
}

.result-container ul {
    margin-bottom: 14px;
    list-style: none;
}

.result-container li {
    width: 100%;
    height: auto;
    padding: 5px 0 3px 0;
    margin: 0 0 7px 0;
}

.result-container li a {
    display: block;
    width: 100%;
    height: auto;
    margin: 0 0 7px 10px;
    font-size: 18px;
    color: #333;
    text-decoration: none;
}

.result-container li:hover {
    background-color: #EFEFEF;
}

.result-container .approved li.orange{
        border-left: 5px solid orange;
}
.result-container .approved li.cssCheck.orange {
    border-left: 5px solid #F5876E;
    border-bottom: 5px solid #F5876E;
    border-top: 5px solid #F5876E;
}

.result-container .green {
    border-left: 5px solid #8EBD40;
}

.result-container .approved li a {
    line-height: auto;
    display: block;
    width: 100%;
    height: auto;
    margin: 0 0 7px 0px;
    font-size: 18px;
    color: #333;
    text-decoration: none;
    padding-left: 10px;
}

.result-container .approved li.cssCheck{
    background:white;
    border-bottom: 5px solid green;
    border-top: 5px solid green;
}

.result-container ul {
    padding-left: 1px;
}

.result-container .approved li {
    background: #F7F5F2;
}

.result-container .approved li:not(.cssCheck):hover {
    background-color: #d0c9c0
}

.result-container li.cssCheck a{
    color: inherit;
}

.result-container li.cssCheck a:hover{
    opacity:0.7;
}

.result-container .close-results{
    position:absolute;
    top:10px;
    right:10px;
    font-size:32px;
}

.result-container .close-results:hover{
    color:darkred;
    cursor:pointer;
}

 .aria-label-viewer{
    position: absolute!important;
    bottom:-20px!important;
    z-index: 9990!important;
    font-size: 12px!important;
    padding:5px 2px 5px 2px!important;
    border-radius: 15px!important;
    color:black!important;
    border: solid;
    background-color: skyblue!important;
    opacity:1!important;
    line-height: 18px!important;
    padding:0px 2px 0px 2px!important;
    display:inline-table!important;
    max-width:150px!important;
}

.analytics-viewer{
    position: fixed;
    left: 10px;
    z-index: 9999;
    font-size: 30px;
    padding: 7px;
    border-radius: 15px;
    background-color: skyblue;

}

.aria-label-highlight{
    border:4px solid red;
    cursor: cell;
}

.viewer-color-0{
    border:#ffc97f 3px solid!important
}

.viewer-color-1{
    border:#eb7777 3px solid!important
}

.viewer-color-2{
    border:#34495e 3px solid!important
}

.viewer-color-3{
    border:#c9e7db 3px solid!important
}

.viewer-color-4{
    border:#9b59b6 3px solid!important
}


.viewer-color-5{
    border:#3e2723 3px solid!important
}

.viewer-color-6{
    border:#ffee58 3px solid!important
}

.viewer-color-7{
    border:#00b0ff 3px solid!important
}

.viewer-color-8{
    border:#311b92 3px solid!important
}


.viewer-color-9{
    border:#f50057 3px solid!important
}

.viewer-color-10{
    border:#827717 3px solid!important
}

.viewer-color-11{
    border:#f06292 3px solid!important
}

.viewer-color-12{
    border:#9E9E9E 3px solid!important
}

.popup-color-0{
    background-color:#ffc97f !important;
    border:#ffc97f solid;
    color:black!important;
    padding:0px 2px 0px 2px!important;
    line-height: 18px!important;
}

.popup-color-1{
    background-color:#eb7777 !important;
    border:#eb7777 solid;
    color:black!important;
}

.popup-color-2{
    background-color:#34495e !important;
    border:#34495e solid;
    color:white!important;
}

.popup-color-3{
    background-color:#c9e7db !important;
    border:#c9e7db solid;
    color:black!important;

}

.popup-color-4{
    background-color:#9b59b6 !important;
    border:#9b59b6 solid;
    color:white!important;
}


.popup-color-5{
    background-color:#3e2723 !important;
    border:#3e2723 solid;
    color:white!important;
}

.popup-color-6{
    background-color:#ffee58 !important;
    border:#ffee58 solid;
    color:black!important;
}

.popup-color-7{
    background-color:#00b0ff !important;
    border:#00b0ff solid;
    color:black!important;
}

.popup-color-8{
    background-color:#311b92 !important;
    border:#311b92 solid;
    color:white!important;
}


.popup-color-9{
    background-color:#f50057 !important;
    border:#f50057 solid;
    color:black!important;
}

.popup-color-10{
    background-color:#827717 !important;
    border:#827717 solid;
    color:black!important;
}

.popup-color-11{
    background-color:#f06292 !important;
    border:#f06292 solid;
    color:black!important;
}

.popup-color-12{
    background-color:#9E9E9E !important;
    border:#9E9E9E solid;
    color:black!important;
}

.aria-label-viewer:hover{
    opacity:1!important;
    z-index:9999!important;
}

.result-container-popup{
    position: fixed;
    z-index: 9999999999;
    width: 220px;
    right: 0;
    top: 50px;
    background-color: bisque;
    padding: 5px;
    border-radius: 12px;
    margin-right: 10px;
    border: 2px solid darkred;
}

.result-container-popup ul{
    list-style:none;
    margin-left:0;
}
.result-container-popup .test-name{
    max-width: 180px;
    display: inline-block;
}


.result-container-popup .qaCheck{
    margin-bottom:5px;
}

.result-container-popup .close-results{
    font-size: 20px;
    position: absolute;
    right: 13px;
    top: 10px;
    border-radius: 25px;
    border: 1px solid darkred;
    background-color: darkred;
    text-align: center;
    color: white;
    width: 25px;
    height: 25px;
    cursor:pointer;
}

.result-container-popup .close-results:hover{
    background-color:#8b00007d;
}

.qaCheck,.linkCheck{
    padding:5px;
    background-color:white;
    border-radius:5px;
}

.qatest > ul > li.green.cssCheck.different-size{
    border-bottom: 5px solid red;
    border-top: 5px solid red;
    background-color:#fbf0cd;
}

.qatest > ul > li.green.cssCheck.hidden{
    display:none;
}

`;





///RESEMBLE JS
/*
James Cryer / Huddle
URL: https://github.com/Huddle/Resemble.js
*/

	'use strict';

	var document = typeof window != "undefined" ? window.document : {
		createElement: function() {
			// This will work as long as only createElement is used on window.document
			var Canvas = require('canvas-prebuilt');
			return new Canvas();
		}
	};

    var oldGlobalSettings = {};
    var globalOutputSettings = oldGlobalSettings;

	function setGlobalOutputSettings(settings) {
		var msg = 'warning resemble.outputSettings mutates global state, and ' +
							'will be removed in 3.0.0';
		globalOutputSettings = settings;
		return this
	}

	var resemble = function( fileData ){
		var pixelTransparency = 1;

		var errorPixelColor = { // Color for Error Pixels. Between 0 and 255.
			red: 255,
			green: 0,
			blue: 255,
			alpha: 255
		};

		var targetPix = {r: 0, g: 0, b: 0, a: 0}; // isAntialiased

		function colorsDistance(c1, c2){
			return (Math.abs(c1.r - c2.r) + Math.abs(c1.g - c2.g) + Math.abs(c1.b - c2.b))/3;
		}

		function withinBoundingBox(x, y, width, height, box) {
		  return x > (box.left || 0) &&
			 x < (box.right || width) &&
			 y > (box.top || 0) &&
			 y < (box.bottom || height);
		}

		function withinComparedArea(x, y, width, height) {
		  var isIncluded = true;

		  if (boundingBox !== undefined && !withinBoundingBox(x, y, width, height, boundingBox)) {
		    isIncluded = false;
		  }

		  if (ignoredBox !== undefined && withinBoundingBox(x, y, width, height, ignoredBox)) {
		    isIncluded = false;
		  }

		  return isIncluded;
		}

		var errorPixelTransform = {
			flat: function (px, offset) {
				px[offset] = errorPixelColor.red;
				px[offset + 1] = errorPixelColor.green;
				px[offset + 2] = errorPixelColor.blue;
				px[offset + 3] = errorPixelColor.alpha;
			},
			movement: function (px, offset, d1, d2) {
				px[offset] = ((d2.r * (errorPixelColor.red / 255)) + errorPixelColor.red) / 2;
				px[offset + 1] = ((d2.g * (errorPixelColor.green / 255)) + errorPixelColor.green) / 2;
				px[offset + 2] = ((d2.b * (errorPixelColor.blue / 255)) + errorPixelColor.blue) / 2;
				px[offset + 3] = d2.a;
			},
			flatDifferenceIntensity: function (px, offset, d1, d2) {
				px[offset] = errorPixelColor.red;
				px[offset + 1] = errorPixelColor.green;
				px[offset + 2] = errorPixelColor.blue;
				px[offset + 3] = colorsDistance(d1, d2);
			},
			movementDifferenceIntensity: function (px, offset, d1, d2) {
				var ratio = colorsDistance(d1, d2) / 255 * 0.8;

				px[offset] = ((1 - ratio) * (d2.r * (errorPixelColor.red / 255)) + ratio * errorPixelColor.red);
				px[offset + 1] = ((1 - ratio) * (d2.g * (errorPixelColor.green / 255)) + ratio * errorPixelColor.green);
				px[offset + 2] = ((1 - ratio) * (d2.b * (errorPixelColor.blue / 255)) + ratio * errorPixelColor.blue);
				px[offset + 3] = d2.a;
			},
			diffOnly: function (px, offset, d1, d2) {
				px[offset] = d2.r;
				px[offset + 1] = d2.g;
				px[offset + 2] = d2.b;
				px[offset + 3] = d2.a;
			}
		};

		var errorPixel = errorPixelTransform.flat;
		var errorType;
		var boundingBox;
		var ignoredBox;
		var largeImageThreshold = 1200;
		var useCrossOrigin = true;
		var data = {};
		var images = [];
		var updateCallbackArray = [];

		var tolerance = { // between 0 and 255
			red: 16,
			green: 16,
			blue: 16,
			alpha: 16,
			minBrightness: 16,
			maxBrightness: 240
		};

		var ignoreAntialiasing = false;
		var ignoreColors = false;
		var scaleToSameSize = false;

		function triggerDataUpdate(){
			var len = updateCallbackArray.length;
			var i;
			for(i=0;i<len;i++){
				if (typeof updateCallbackArray[i] === 'function'){
					updateCallbackArray[i](data);
				}
			}
		}

		function loop(w, h, callback){
			var x,y;

			for (x=0;x<w;x++){
				for (y=0;y<h;y++){
					callback(x, y);
				}
			}
		}

		function parseImage(sourceImageData, width, height){

			var pixelCount = 0;
			var redTotal = 0;
			var greenTotal = 0;
			var blueTotal = 0;
			var alphaTotal = 0;
			var brightnessTotal = 0;
			var whiteTotal = 0;
			var blackTotal = 0;

			loop(width, height, function(horizontalPos, verticalPos){
				var offset = (verticalPos*width + horizontalPos) * 4;
				var red = sourceImageData[offset];
				var green = sourceImageData[offset + 1];
				var blue = sourceImageData[offset + 2];
				var alpha = sourceImageData[offset + 3];
				var brightness = getBrightness(red,green,blue);

				if (red == green && red == blue && alpha) {
					if (red == 0) {
						blackTotal++
					} else if (red == 255) {
						whiteTotal++
					}
				}

				pixelCount++;

				redTotal += red / 255 * 100;
				greenTotal += green / 255 * 100;
				blueTotal += blue / 255 * 100;
				alphaTotal += (255 - alpha) / 255 * 100;
				brightnessTotal += brightness / 255 * 100;
			});

			data.red = Math.floor(redTotal / pixelCount);
			data.green = Math.floor(greenTotal / pixelCount);
			data.blue = Math.floor(blueTotal / pixelCount);
			data.alpha = Math.floor(alphaTotal / pixelCount);
			data.brightness = Math.floor(brightnessTotal / pixelCount);
			data.white = Math.floor(whiteTotal / pixelCount * 100);
			data.black = Math.floor(blackTotal / pixelCount * 100);

			triggerDataUpdate();
		}

		function loadImageData( fileData, callback ){
			var fileReader;
			var hiddenImage;
			if (typeof Image !== 'undefined') {
				hiddenImage = new Image();
			} else {
				var CanvasImage = require('canvas-prebuilt').Image;
				hiddenImage = new CanvasImage();
				hiddenImage.setAttribute = function setAttribute() { };
			}

			if(useCrossOrigin) {
				hiddenImage.setAttribute('crossorigin', 'anonymous');
			}

			hiddenImage.onerror = function (err) {
				hiddenImage.onerror = null; //fixes pollution between calls
				images.push({ error : err ? err + "" : "Image load error." });
				callback();
			};

			hiddenImage.onload = function() {
				hiddenImage.onload = null; //fixes pollution between calls

				var hiddenCanvas =  document.createElement('canvas');
				var imageData;

				// don't assign to hiddenImage, see https://github.com/Huddle/Resemble.js/pull/87/commits/300d43352a2845aad289b254bfbdc7cd6a37e2d7
				var width = hiddenImage.width;
				var height = hiddenImage.height;

				if( scaleToSameSize && images.length == 1 ){
					width   = images[0].width;
					height  = images[0].height;
				}

				hiddenCanvas.width = width;
				hiddenCanvas.height = height;

				hiddenCanvas.getContext('2d').drawImage(hiddenImage, 0, 0, width, height);
				imageData = hiddenCanvas.getContext('2d').getImageData(0, 0, width, height);

				images.push(imageData);

				callback(imageData, width, height);
			};

			if (typeof fileData === 'string') {
				hiddenImage.src = fileData;
				if (hiddenImage.complete && hiddenImage.naturalWidth > 0) {
					hiddenImage.onload();
				}
			} else if (typeof fileData.data !== 'undefined'
					&& typeof fileData.width === 'number'
					&& typeof fileData.height === 'number') {

				images.push(fileData);

				callback(fileData, fileData.width, fileData.height);
			} else if (typeof Buffer !== 'undefined' && fileData instanceof Buffer){
				// If we have Buffer, assume we're on Node+Canvas and its supported
				hiddenImage.src = fileData;
			} else {
				fileReader = new FileReader();
				fileReader.onload = function (event) {
					hiddenImage.src = event.target.result;
				};
				fileReader.readAsDataURL(fileData);
			}
		}

		function isColorSimilar(a, b, color){

			var absDiff = Math.abs(a - b);

			if(typeof a === 'undefined'){
				return false;
			}
			if(typeof b === 'undefined'){
				return false;
			}

			if(a === b){
				return true;
			} else if ( absDiff < tolerance[color] ) {
				return true;
			} else {
				return false;
			}
		}

		function isPixelBrightnessSimilar(d1, d2){
			var alpha = isColorSimilar(d1.a, d2.a, 'alpha');
			var brightness = isColorSimilar(d1.brightness, d2.brightness, 'minBrightness');
			return brightness && alpha;
		}

		function getBrightness(r,g,b){
			return 0.3*r + 0.59*g + 0.11*b;
		}

		function isRGBSame(d1,d2){
			var red = d1.r === d2.r;
			var green = d1.g === d2.g;
			var blue = d1.b === d2.b;
			return red && green && blue;
		}

		function isRGBSimilar(d1, d2){
			var red = isColorSimilar(d1.r,d2.r,'red');
			var green = isColorSimilar(d1.g,d2.g,'green');
			var blue = isColorSimilar(d1.b,d2.b,'blue');
			var alpha = isColorSimilar(d1.a, d2.a, 'alpha');

			return red && green && blue && alpha;
		}

		function isContrasting(d1, d2){
			return Math.abs(d1.brightness - d2.brightness) > tolerance.maxBrightness;
		}

		function getHue(r,g,b){

			r = r / 255;
			g = g / 255;
			b = b / 255;
			var max = Math.max(r, g, b), min = Math.min(r, g, b);
			var h;
			var d;

			if (max == min){
				h = 0; // achromatic
			} else{
				d = max - min;
				switch(max){
					case r: h = (g - b) / d + (g < b ? 6 : 0); break;
					case g: h = (b - r) / d + 2; break;
					case b: h = (r - g) / d + 4; break;
				}
				h /= 6;
			}

			return h;
		}

		function isAntialiased(sourcePix, data, cacheSet, verticalPos, horizontalPos, width){
			var offset;
			var distance = 1;
			var i;
			var j;
			var hasHighContrastSibling = 0;
			var hasSiblingWithDifferentHue = 0;
			var hasEquivalentSibling = 0;

			addHueInfo(sourcePix);

			for (i = distance*-1; i <= distance; i++){
				for (j = distance*-1; j <= distance; j++){

					if(i===0 && j===0){
						// ignore source pixel
					} else {

						offset = ((verticalPos+j)*width + (horizontalPos+i)) * 4;

						if(!getPixelInfo(targetPix , data, offset, cacheSet)){
							continue;
						}

						addBrightnessInfo(targetPix);
						addHueInfo(targetPix);

						if( isContrasting(sourcePix, targetPix) ){
							hasHighContrastSibling++;
						}

						if( isRGBSame(sourcePix,targetPix) ){
							hasEquivalentSibling++;
						}

						if( Math.abs(targetPix.h - sourcePix.h) > 0.3 ){
							hasSiblingWithDifferentHue++;
						}

						if( hasSiblingWithDifferentHue > 1 || hasHighContrastSibling > 1){
							return true;
						}
					}
				}
			}

			if(hasEquivalentSibling < 2){
				return true;
			}

			return false;
		}

		function copyPixel(px, offset, data){
			if (errorType === 'diffOnly') {
				return;
			}

			px[offset] = data.r; //r
			px[offset + 1] = data.g; //g
			px[offset + 2] = data.b; //b
			px[offset + 3] = data.a * pixelTransparency; //a
		}

		function copyGrayScalePixel(px, offset, data){
			if (errorType === 'diffOnly') {
				return;
			}

			px[offset] = data.brightness; //r
			px[offset + 1] = data.brightness; //g
			px[offset + 2] = data.brightness; //b
			px[offset + 3] = data.a * pixelTransparency; //a
		}

		function getPixelInfo(dst, data, offset) {
			if (data.length > offset) {
				dst.r = data[offset];
				dst.g = data[offset + 1];
				dst.b = data[offset + 2];
				dst.a = data[offset + 3];

				return true;
			}

			return false;
		}

		function addBrightnessInfo(data){
			data.brightness = getBrightness(data.r,data.g,data.b); // 'corrected' lightness
		}

		function addHueInfo(data){
			data.h = getHue(data.r,data.g,data.b);
		}

		function analyseImages(img1, img2, width, height){

			var hiddenCanvas = document.createElement('canvas');

			var data1 = img1.data;
			var data2 = img2.data;

			hiddenCanvas.width = width;
			hiddenCanvas.height = height;

			var context = hiddenCanvas.getContext('2d');
			var imgd = context.createImageData(width,height);
			var targetPix = imgd.data;

			var mismatchCount = 0;
			var diffBounds = {
				top: height,
				left: width,
				bottom: 0,
				right: 0
			};
			var updateBounds = function(x, y) {
				diffBounds.left = Math.min(x, diffBounds.left);
				diffBounds.right = Math.max(x, diffBounds.right);
				diffBounds.top = Math.min(y, diffBounds.top);
				diffBounds.bottom = Math.max(y, diffBounds.bottom);
			};

			var time = Date.now();

			var skip;

			if(!!largeImageThreshold && ignoreAntialiasing && (width > largeImageThreshold || height > largeImageThreshold)){
				skip = 6;
			}

			var pixel1 = {r: 0, g: 0, b: 0, a: 0};
			var pixel2 = { r: 0, g: 0, b: 0, a: 0 };

			loop(width, height, function(horizontalPos, verticalPos){

				if(skip){ // only skip if the image isn't small
					if(verticalPos % skip === 0 || horizontalPos % skip === 0){
						return;
					}
				}

				var offset = (verticalPos*width + horizontalPos) * 4;
				var isWithinComparedArea = withinComparedArea(horizontalPos, verticalPos, width, height);

				if (!getPixelInfo(pixel1, data1, offset, 1) || !getPixelInfo(pixel2, data2, offset, 2)) {
					return;
				}

				if (ignoreColors){

					addBrightnessInfo(pixel1);
					addBrightnessInfo(pixel2);

					if( isPixelBrightnessSimilar(pixel1, pixel2) || !isWithinComparedArea ){
						copyGrayScalePixel(targetPix, offset, pixel2);
					} else {
						errorPixel(targetPix, offset, pixel1, pixel2);
						mismatchCount++;
						updateBounds(horizontalPos, verticalPos);
					}
					return;
				}

				if( isRGBSimilar(pixel1, pixel2)  || !isWithinComparedArea ){
					copyPixel(targetPix, offset, pixel1);

				} else if( ignoreAntialiasing && (
						addBrightnessInfo(pixel1), // jit pixel info augmentation looks a little weird, sorry.
						addBrightnessInfo(pixel2),
						isAntialiased(pixel1, data1, 1, verticalPos, horizontalPos, width) ||
						isAntialiased(pixel2, data2, 2, verticalPos, horizontalPos, width)
					)){

					if( isPixelBrightnessSimilar(pixel1, pixel2) || !isWithinComparedArea ){
						copyGrayScalePixel(targetPix, offset, pixel2);
					} else {
						errorPixel(targetPix, offset, pixel1, pixel2);
						mismatchCount++;
						updateBounds(horizontalPos, verticalPos);
					}
				} else {
					errorPixel(targetPix, offset, pixel1, pixel2);
					mismatchCount++;
					updateBounds(horizontalPos, verticalPos);
				}

			});

			data.rawMisMatchPercentage = (mismatchCount / (height*width) * 100);
			data.misMatchPercentage = data.rawMisMatchPercentage.toFixed(2);
			data.diffBounds = diffBounds;
			data.analysisTime = Date.now() - time;

			data.getImageDataUrl = function(text){
				var barHeight = 0;

				if(text){
					barHeight = addLabel(text,context,hiddenCanvas);
				}

				context.putImageData(imgd, 0, barHeight);

				return hiddenCanvas.toDataURL("image/png");
			};

			if (hiddenCanvas.toBuffer) {
				data.getBuffer = function(includeOriginal) {
					if (includeOriginal) {
						var imageWidth = hiddenCanvas.width + 2;
						hiddenCanvas.width = imageWidth * 3;
						context.putImageData(img1, 0, 0);
						context.putImageData(img2, imageWidth, 0);
						context.putImageData(imgd, imageWidth * 2, 0);
					} else {
						context.putImageData(imgd, 0, 0);
					}
					return hiddenCanvas.toBuffer();
				}
			}
		}

		function addLabel(text, context, hiddenCanvas){
			var textPadding = 2;

			context.font = '12px sans-serif';

			var textWidth = context.measureText(text).width + textPadding*2;
			var barHeight = 22;

			if(textWidth > hiddenCanvas.width){
				hiddenCanvas.width = textWidth;
			}

			hiddenCanvas.height += barHeight;

			context.fillStyle = "#666";
			context.fillRect(0,0,hiddenCanvas.width,barHeight -4);
			context.fillStyle = "#fff";
			context.fillRect(0,barHeight -4,hiddenCanvas.width, 4);

			context.fillStyle = "#fff";
			context.textBaseline = "top";
			context.font = '12px sans-serif';
			context.fillText(text, textPadding, 1);

			return barHeight;
		}

		function normalise(img, w, h){
			var c;
			var context;

			if(img.height < h || img.width < w){
				c = document.createElement('canvas');
				c.width = w;
				c.height = h;
				context = c.getContext('2d');
				context.putImageData(img, 0, 0);
				return context.getImageData(0, 0, w, h);
			}

			return img;
		}

		function outputSettings(options){
			var key;
			var undefined;

			if(options.errorColor){
				for (key in options.errorColor) {
					errorPixelColor[key] = options.errorColor[key] === undefined ? errorPixelColor[key] : options.errorColor[key];
				}
			}

			if(options.errorType && errorPixelTransform[options.errorType] ){
				errorPixel = errorPixelTransform[options.errorType];
				errorType = options.errorType;
			}

			if(options.errorPixel && typeof options.errorPixel === "function") {
				errorPixel = options.errorPixel;
			}

			pixelTransparency = isNaN(Number(options.transparency)) ? pixelTransparency : options.transparency;

			if (options.largeImageThreshold !== undefined) {
				largeImageThreshold = options.largeImageThreshold;
			}

			if (options.useCrossOrigin !== undefined) {
				useCrossOrigin = options.useCrossOrigin;
			}

			if (options.boundingBox !== undefined) {
				boundingBox = options.boundingBox;
			}

			if (options.ignoredBox !== undefined) {
				ignoredBox = options.ignoredBox;
			}

		}

		function compare(one, two){
			if (globalOutputSettings !== oldGlobalSettings) {
				outputSettings(globalOutputSettings);
			}

			function onceWeHaveBoth(){
				var width;
				var height;
				if(images.length === 2){
					if( images[0].error || images[1].error ){
						data = {};
						data.error = images[0].error ?  images[0].error : images[1].error;
						triggerDataUpdate();
						return;
					}
					width = images[0].width > images[1].width ? images[0].width : images[1].width;
					height = images[0].height > images[1].height ? images[0].height : images[1].height;

					if( (images[0].width === images[1].width) && (images[0].height === images[1].height) ){
						data.isSameDimensions = true;
					} else {
						data.isSameDimensions = false;
					}

					data.dimensionDifference = { width: images[0].width - images[1].width, height: images[0].height - images[1].height };

					analyseImages( normalise(images[0],width, height), normalise(images[1],width, height), width, height);

					triggerDataUpdate();
				}
			}

			images = [];
			loadImageData(one, onceWeHaveBoth);
			loadImageData(two, onceWeHaveBoth);
		}

		function getCompareApi(param){

			var secondFileData,
				hasMethod = typeof param === 'function';

			if( !hasMethod ){
				// assume it's file data
				secondFileData = param;
			}

			var self = {
				scaleToSameSize: function(){
					scaleToSameSize = true;

					if(hasMethod) { param(); }
					return self;
				},
				useOriginalSize: function(){
					scaleToSameSize = false;

					if(hasMethod) { param(); }
					return self;
				},
				ignoreNothing: function(){

					tolerance.red = 0;
					tolerance.green = 0;
					tolerance.blue = 0;
					tolerance.alpha = 0;
					tolerance.minBrightness = 0;
					tolerance.maxBrightness = 255;

					ignoreAntialiasing = false;
					ignoreColors = false;

					if(hasMethod) { param(); }
					return self;
				},
				ignoreLess: function(){

					tolerance.red = 16;
					tolerance.green = 16;
					tolerance.blue = 16;
					tolerance.alpha = 16;
					tolerance.minBrightness = 16;
					tolerance.maxBrightness = 240;

					ignoreAntialiasing = false;
					ignoreColors = false;

					if(hasMethod) { param(); }
					return self;
				},
				ignoreAntialiasing: function(){

					tolerance.red = 32;
					tolerance.green = 32;
					tolerance.blue = 32;
					tolerance.alpha = 32;
					tolerance.minBrightness = 64;
					tolerance.maxBrightness = 96;

					ignoreAntialiasing = true;
					ignoreColors = false;

					if(hasMethod) { param(); }
					return self;
				},
				ignoreColors: function(){

					tolerance.alpha = 16;
					tolerance.minBrightness = 16;
					tolerance.maxBrightness = 240;

					ignoreAntialiasing = false;
					ignoreColors = true;

					if(hasMethod) { param(); }
					return self;
				},
				ignoreAlpha: function() {

					tolerance.red = 16;
					tolerance.green = 16;
					tolerance.blue = 16;
					tolerance.alpha = 255;
					tolerance.minBrightness = 16;
					tolerance.maxBrightness = 240;

					ignoreAntialiasing = false;
					ignoreColors = false;

					if(hasMethod) { param(); }
					return self;
				},
				repaint: function(){
					if(hasMethod) { param(); }
					return self;
				},
				outputSettings: function(options) {
					outputSettings(options);
					return self;
				},
				onComplete: function( callback ){

					updateCallbackArray.push(callback);

					var wrapper = function(){
						compare(fileData, secondFileData);
					};

					wrapper();

					return getCompareApi(wrapper);
				}
			};

			return self;
		}

		var rootSelf = {
			onComplete: function( callback ){
				updateCallbackArray.push(callback);
				loadImageData(fileData, function(imageData, width, height){
					parseImage(imageData.data, width, height);
				});
			},
			compareTo: function(secondFileData){
				return getCompareApi(secondFileData);
			},
			outputSettings: function(options) {
				outputSettings(options);
				return rootSelf;
			}
		};
		return rootSelf;
	};

	function applyIgnore(api, ignore) {
		switch (ignore) {
			case 'nothing':
				api.ignoreNothing();
				break;
			case 'less':
				api.ignoreLess();
				break;
			case 'antialiasing':
				api.ignoreAntialiasing();
				break;
			case 'colors':
				api.ignoreColors();
				break;
			case 'alpha':
				api.ignoreAlpha();
				break;
			default:
				throw new Error('Invalid ignore: ' + ignore);
				break;
		}
	}

	resemble.compare = function (image1, image2, options, callback) {
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}

		var res = resemble(image1), opt = options || {}, compare;

		if (opt.output) {
			res.outputSettings(opt.output);
		}

		compare = res.compareTo(image2);

		if (opt.scaleToSameSize) {
			compare.scaleToSameSize();
		}

		if (typeof opt.ignore === 'string') {
			applyIgnore(compare, opt.ignore);
		} else if (opt.ignore && opt.ignore.forEach) {
			opt.ignore.forEach(function (v) {
				applyIgnore(compare, v);
			});
		}

		compare.onComplete(function(data) {
			if (data.error) {
				callback(data.error);
			} else {
				callback(null, data);
			}
		});
	};

	resemble.outputSettings = setGlobalOutputSettings;



    window.onload=()=>{

           chrome.storage.sync.get({
            settings:{}
            }, function(result) {
                locale_variable=result.settings.locale_variable;
                locale_short_variable=result.settings.locale_short_variable;
                page_locale_variable=result.settings.page_locale_variable;
                page_lang_variable=result.settings.page_lang_variable;
                sitename_variable=result.settings.sitename_variable;
                popup_remove_variable=result.settings.popup_remove_variable;
                support_link_variable=result.settings.support_link_variable;
                
                if(!locale_variable)
                {
                    locale_variable="/tr/";
                }

                if(!locale_short_variable)
                {
                    locale_short_variable="tr";
                }
                if(!page_locale_variable)
                {
                    page_locale_variable="tr_TR";
                }
                if(!page_lang_variable)
                {
                    page_lang_variable="tr-TR";
                }
                if(!sitename_variable)
                {
                    sitename_variable="Apple (Türkiye)";
                }
                if(!popup_remove_variable)
                {
                    popup_remove_variable=1500;
                }
                if(!support_link_variable)
                {
                    support_link_variable="tr-tr";
                }


                qaCheckPromises(true);
        });
    };


    window.onclick=(e)=>{

        if(e.metaKey && e.shiftKey) {
            let url=window.location.href;
            if(window.location.href.indexOf(locale_variable)===-1)
            {
                url=window.location.origin+locale_variable+window.location.pathname;
            }
            else{
                url=window.location.href.replace(locale_variable,"/");
            }
            chrome.runtime.sendMessage({type:'open_us_page',url:url});
        } 
        if(e.metaKey && e.altKey) {
            var img = e.target,
            style = img.currentStyle || window.getComputedStyle(img, false),
            bi = style.backgroundImage.slice(4, -1).replace(/"/g, "");
            chrome.runtime.sendMessage({type:'open_us_page',url:bi});
        } 
    };