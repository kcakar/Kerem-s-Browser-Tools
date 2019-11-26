const BASE_URL=`https://www.apple.com`;
const COUNTRY_SELECT_URL=`${BASE_URL}/choose-country-region/`;
const GET_COUNTRY_SETTINGS_PATH=`iphone/`;

function addLink() {
    var newLink = document.getElementById('newLink').value;

    let whitelist=getLinks();
    if(newLink.indexOf("http")==-1 && newLink.indexOf("https")==-1)
    {
        newLink="https://"+newLink;
    }

    whitelist.push(newLink);
    fillWhitelist(whitelist);
    saveOptions();
}

function removeLink(e) {
  const toRemove=this.getAttribute("data-delete");
  let element=document.getElementsByClassName(toRemove);
  if(element.length>0)
  {
      document.getElementsByClassName(toRemove)[0].remove();
  }
  saveOptions();
}

function fillWhitelist(whitelist)
{
  let html="";

  whitelist.forEach(item=>{
      html+="<li class='"+item+"'><button class='delete' data-delete='"+item+"'>Delete</button> <a href='"+item+"'>"+item+"</a> </li>";
  });
  document.getElementById('whitelist-ul').innerHTML = html;
  bindDeleteEvent();
}

function getLinks()
{
  let links=document.querySelectorAll("a");
  let whitelist=[];

  links.forEach(link=>{
      whitelist.push(link.href);
  })

  return whitelist;
}

function saveOptions(){
  let whitelist=getLinks();
  let popup_duration=document.getElementById("popup_remove_variable").value;
  chrome.storage.sync.set({ whitelist: whitelist,popup_duration:popup_duration}, function() {
      var status = document.getElementById('status');
      status.textContent = 'Settings saved.';
      setTimeout(function() {
          status.textContent = '';
      }, 750);
  });
}

function restore_options() {
  chrome.storage.sync.get(null, function(result) {
    if(!result.settings_part1){
      getSettingsAutomatically();
    }
    else{
      if(result.whitelist){
        fillWhitelist(result.whitelist);
      }
      else{
          chrome.storage.sync.set({ whitelist:[]}, function() { });
      }
      document.getElementById("popup_remove_variable").value=result.popup_duration;
    }
  });
}

function getSettingsAutomatically(){
  setLoading(true);
  //GET COUNTRY SELECT HTML
  fetch(COUNTRY_SELECT_URL).then(function (response) {
    return response.text();
  })
  .then(function (pageHtml) {
    //MAKE READY THE HTML
    var usHTML = document.createElement('div');
    usHTML.innerHTML = pageHtml.trim();

    //Get list of country URLs
    const countryUrls=getCountryUrls(usHTML);
    //GET THE SETTINGS FOR EACH COUNTRY
    getCountryHtmls(countryUrls)
    .then(texts => {
      const countrySettings=getCountrySettingsFromHtmls(texts);
      saveSettings(countrySettings);
    });
  })
  .catch(function(){
      
  });
}

function getCountryUrls(usHTML){
  let countryUrls=[];
  usHTML.querySelectorAll(".countrylist-item a").forEach(countryElement=>
  {
    const countryCode=countryElement.attributes.href.value;
    if(countryCode.indexOf(BASE_URL)===-1){
      countryUrls.push(`${BASE_URL}${countryCode}${GET_COUNTRY_SETTINGS_PATH}`);
    }
  });
  console.log(countryUrls)
  return countryUrls;
}

function getCountryHtmls(countryUrls){
  let i=0;
  const progressElement=document.getElementById("progress-count");

  document.getElementById("total").innerHTML=countryUrls.length;
  progressElement.innerHTML="0";
  return Promise.all(countryUrls.map(url =>
    fetch(url).then(resp => {
      i++;
      progressElement.innerHTML=i;
      return resp.text()
      })
  ));
}

function getCountrySettingsFromHtmls(countryHtmls){
  let countrySettings=[];
  countryHtmls.map(countryCode=>{
    var countryHtml = document.createElement('div');
    countryHtml.innerHTML = countryCode.trim();
    let settings={};
    settings.locale_variable= countryHtml.querySelector("meta[property='og:url']").content.replace("https://www.apple.com","").replace("/iphone","");
    settings.locale_short_variable=settings.locale_variable.replace("/","").replace("/","");
    settings.page_locale_variable=countryHtml.querySelector("meta[property='og:locale']").content;
    settings.page_lang_variable=countryHtml.querySelector("[lang]").attributes.lang.value;
    settings.sitename_variable=countryHtml.querySelector("meta[property='og:site_name']").content;
    settings.support_link_variable=countryHtml.querySelector(".ac-gn-link-support").attributes.href.value.split("/").pop();
    countrySettings.push(settings);
  })
  return countrySettings;
}

function saveSettings(settings) {
  let splitSettingsList=splitSettings(settings);
  chrome.storage.sync.set({ 
    settings_part1:splitSettingsList[0],
    settings_part2:splitSettingsList[1],
    settings_part3:splitSettingsList[2],
    settings_part4:splitSettingsList[3],
    settings_part5:splitSettingsList[4],
    popup_duration:1500
    }, function() {
      setLoading(false);
  });
}

function splitSettings(array){
  let settingsList=[];
  var i,j,temparray,chunk = 30;
  for (i=0,j=array.length; i<j; i+=chunk) {
      temparray = array.slice(i,i+chunk);
      settingsList.push(temparray);
  }
  return settingsList;
}


function setLoading(state)
{
  let loadingHTML=document.querySelector(".loading-div-extension");
  if(!state){
    loadingHTML.style.display="none";
  }
  else{
    loadingHTML.style.display="flex";
  }
}

function bindDeleteEvent(){
  let elements=document.getElementsByClassName("delete");
  [].forEach.call(elements, function (el) {
    el.addEventListener("click",removeLink);
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('add').addEventListener('click',addLink);
document.getElementById('save').addEventListener('click',saveOptions);
document.getElementById('get').addEventListener('click',getSettingsAutomatically);