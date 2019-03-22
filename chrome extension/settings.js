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

  function saveSettings() {
    let settings={};
    settings.locale_short_variable=document.getElementById('locale_short_variable').value;
    settings.locale_variable="/"+settings.locale_short_variable+"/";
    settings.page_locale_variable=document.getElementById('page_locale_variable').value;
    settings.page_lang_variable=document.getElementById('page_lang_variable').value;
    settings.sitename_variable=document.getElementById('sitename_variable').value;
    settings.popup_remove_variable=document.getElementById('popup_remove_variable').value;
    settings.support_link_variable=document.getElementById('support_link_variable').value;
    saveOptions(settings);
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

  function saveOptions(settings){
        let whitelist=getLinks();

        chrome.storage.sync.set({ whitelist: whitelist,settings:settings,}, function() {
            var status = document.getElementById('status');
            status.textContent = 'Whitelist saved.';
            status2.textContent = 'Settings saved.';
            setTimeout(function() {
                status.textContent = '';
                status2.textContent = '';
            }, 750);
        });
  }

  function restore_options() {
    chrome.storage.sync.get({
        whitelist:[],
        settings:{}
    }, function(result) {
      console.log(result);
        if(Object.keys(result.settings).length===0){
          saveOptions(fillDefaultSettings());
          restore_options();
        }
        else{
          fillWhitelist(result.whitelist);
          fillSettings(result.settings);
        }
    });
  }

  function fillDefaultSettings(){
    let settings={};
    settings.locale_variable="/tr/";
    settings.locale_short_variable="tr";
    settings.page_locale_variable="tr_TR";
    settings.page_lang_variable="tr-TR";
    settings.sitename_variable="Apple (Türkiye)";
    settings.popup_remove_variable=1500;
    settings.support_link_variable="tr-tr";

    
    return settings;
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

  function fillSettings(settings){
    Object.keys(settings).forEach(key=>{
        const element=document.getElementById(key);
        if(element){
          element.value=settings[key];
        }
    })
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

  function bindDeleteEvent(){
    let elements=document.getElementsByClassName("delete");
    [].forEach.call(elements, function (el) {
      el.addEventListener("click",removeLink);
    });
  }

  document.addEventListener('DOMContentLoaded', restore_options);
  document.getElementById('add').addEventListener('click',addLink);
  document.getElementById('save').addEventListener('click',saveSettings);



