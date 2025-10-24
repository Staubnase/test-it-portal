console.log("✅ Custom.js Override aktiv");

/* ----------------------------------------------- */
/* ----------------- Script Loader --------------- */
/* ----------------------------------------------- */
// This helps with loading scripts and debugging
// Pass in the path of the js file and an array of url segments on which to run this code
// EG loadScript("/CustomSpace/CustomExtension/CustomExtension.js",["ServiceRequest","Incident"]);
var loadScript = function (path,urls) { 
  urls.forEach(function(url){  
    if(window.location.href.indexOf(url) !== -1){ // Verify we are on the valid page
      var result = $.Deferred(),
          script = document.createElement("script");
      script.async = "async";
      script.type = "text/javascript";
      script.src = path;
      script.onload = script.onreadystatechange = function(_, isAbort) {
        if (!script.readyState || /loaded|complete/.test(script.readyState)) {
          if (isAbort) result.reject();
          else result.resolve();
        }
      };
      script.onerror = function () { result.reject(); };
      $("head")[0].appendChild(script);
      console.log("Loaded " + path)
      return result.promise();
    }
  })
};
/* ----------------------------------------------- */
/* --------------- END Script Loader ------------- */
/* ----------------------------------------------- */

/* ----------------------------------------------- */
/* --------- Customization Portal ---------------- */
/* ----------------------------------------------- */

// Set Default "KnowledgeBase" obere Leiste
$(window).ready(function () {
  var searchParam = $("input[name=search_param]"); //the hidden field which holds the search type id
  var searchConcept = $("span[id=search_concept]"); //the span field which displays the search type value
  var searchInput = $("input[name=searchText]");
  searchParam.val("KnowledgeBase");
  searchConcept.html(localization.KnowledgeBase);
  searchInput.attr('placeholder', localization.SearchKnowledgeBase);
}); 

/* ----------------------------------------------- */
/* --- CUSTOMIZATION INCIDENTS & SERVICEREQUEST ---*/
/* ----------------------------------------------- */

// Adds accesskeys to buttons on bottom drawer (save, apply and cancel)
loadScript("/CustomSpace/Customization/AccessKeys/AccessKeys.js",['/Incident','/ServiceRequest/']);

/* ----------------------------------------------- */
/* ----------- Advanced Portal Search App --------- */
/* ----------------------------------------------- */

//Load Search Common Functions (lib)
loadScript("/CustomSpace/Customization/AdvancedPortalSearch/SearchLib.js",['']);

// Load Search Extensions
loadScript("/CustomSpace/Customization/AdvancedPortalSearch/SoftwareAssetSearch.js",['']);

// Initialize Advanced Portal Search code
loadScript("/CustomSpace/Customization/AdvancedPortalSearch/InitSearch.js",['']);
    
/* ----------------------------------------------- */
/* ---------END Avanced Portal Search App -------- */
/* ----------------------------------------------- */

/* ----------------------------------------------- */
/* --------- CUSTOMIZATION INCIDENTS ------------- */
/* ----------------------------------------------- */

// hide "Print" for everyone - english
app.custom.formTasks.add('Incident', null, function (formObj, viewModel) { formObj.boundReady(function () { $( ".taskmenu li:contains('Print')" ).hide() }); }); 

// hide "Drucken" for everyone - german
app.custom.formTasks.add('Incident', null, function (formObj, viewModel) { formObj.boundReady(function () { $( ".taskmenu li:contains('Drucken')" ).hide() }); }); 

// hide "close incident" for everyone - english
app.custom.formTasks.add('Incident', null, function (formObj, viewModel) {formObj.boundReady(function () {$( ".taskmenu li:contains('Close Incident')" ).hide() }); }); 

// hide "Incident schliessen" for everyone - german
app.custom.formTasks.add('Incident', null, function (formObj, viewModel) {formObj.boundReady(function () {$( ".taskmenu li:contains('Incident schliessen')" ).hide() }); }); 

// hide "Incident Assign To Analyst By Group" for everyone - english
app.custom.formTasks.add('Incident', null, function (formObj, viewModel) {formObj.boundReady(function () {$( ".taskmenu li:contains('Assign To Analyst By Group')" ).hide() }); });

// hide "Incident Gruppenbasierte Analysten-Zuweisung" for everyone - german
app.custom.formTasks.add('Incident', null, function (formObj, viewModel) {formObj.boundReady(function () {$( ".taskmenu li:contains('Gruppenbasierte Analysten-Zuweisung')" ).hide() }); }); 

// hide "Bestätigung" for everyone - german
app.custom.formTasks.add('Incident', null, function (formObj, viewModel) {formObj.boundReady(function () {$( ".taskmenu li:contains('Bestätigung')" ).hide() }); }); 

// hide "Acknowledge" for everyone - english
app.custom.formTasks.add('Incident', null, function (formObj, viewModel) {formObj.boundReady(function () {$( ".taskmenu li:contains('Acknowledge')" ).hide() }); }); 

// Have "Show Activities" checked by default in the My Work pane
$(document).ready(function (){
  //click the show activities by default
  if(window.location.href.indexOf("cca5abda-6803-4833-accd-d59a43e2d2cf") > -1){
    console.log("I'm on the My Work page!");
    setTimeout(function (){
      $('#showActivitiesInGrid[value=false]').prev('input[type=checkbox]').trigger('click');
    }, 1000);
  };
});

// hide by role (non-analyst)
app.custom.formTasks.add('Incident', null, function (formObj, viewModel) {
  formObj.boundReady(function(){
    var vm = pageForm.viewModel; 
    if (!session.user.Analyst) {
      $( ".taskmenu li:contains('Add Me To WatchList')" ).hide()
      $( ".taskmenu li:contains('Status Active')" ).hide()
      $( ".taskmenu li:contains('Status Pending - Customer')" ).hide()    
      $( ".taskmenu li:contains('Status Pending - IT')" ).hide()
      $( ".taskmenu li:contains('Status Hardware-Service')" ).hide()
      //$( ".taskmenu li:contains('Status Resolved')" ).hide()
    }
  });
  return;
}); 

// ContactInformations
app.custom.formTasks.add('Incident', null, function (formObj, viewModel) {
  formObj.boundReady(function () {
    //Get Alternate Contact Method input element
    var contactObject = $('input[name="ContactMethod"]');
    //Hide input field
    contactObject.css("display", "none");
    
    //Insert Business phone and private phone as clickable links
    contactObject.before('<span id="ContactPhone" class="help-block"><i class="fa fa-phone"></i>&nbsp;&nbsp;Business: <a href="tel:'+ viewModel.RequestedWorkItem.BusinessPhone + '">' + viewModel.RequestedWorkItem.BusinessPhone + '</a>&nbsp;&nbsp;|&nbsp;&nbsp;Mobile: <a href="tel:'+ viewModel.RequestedWorkItem.Mobile + '">' + viewModel.RequestedWorkItem.Mobile + '</a></span>');
    contactObject.before('<span id="ContactPhone" class="help-block"><i class="fa fa-mail-forward"></i>&nbsp;&nbsp;Mail: <a href="mailto:'+ viewModel.RequestedWorkItem.UPN + '">' + viewModel.RequestedWorkItem.UPN + '</a>&nbsp;&nbsp;|&nbsp;&nbsp;Function: ' + viewModel.RequestedWorkItem.Title + '</a></span>');
    //Add @mention help text with affected display name
    $('label[for="commentBoxEditor"]').append('<span class="help-block" style="font-weight: 100;display: inline;">&nbsp;&nbsp;( To Notify affected user write: <span style="color: black;">@' + viewModel.RequestedWorkItem.DisplayName + ' </span>)</span>');
  });
});

// Sort Task Menu
(function() {
  var browseByCategoryObserver = new MutationObserver(function (mutations) {
    var mylist = $('ul[class=taskmenu]')
    if ( mylist ) {
      var listitems = mylist.children('li').get();
      listitems.sort(function(a, b) {
        return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
      })
      $.each(listitems, function(idx, itm) { mylist.append(itm); });
      browseByCategoryObserver.disconnect();
    }
  });
  
  var observerConfig = { attributes: false, childList: true, characterData: false, subtree: true };
  
  $(document).ready(function () {
    var targetNode = document.getElementById('main_wrapper');
    if (targetNode) browseByCategoryObserver.observe(targetNode, observerConfig);
  });
})();

/* ----------------------------------------------- */
/* -------- Customization Service Request -------- */
/* ----------------------------------------------- */

// hide "ServiceRequest Add Me To WatchList" for everyone - english
app.custom.formTasks.add('ServiceRequest', null, function (formObj, viewModel) { formObj.boundReady(function () { $( ".taskmenu li:contains('Add Me To WatchList')" ).hide() }); }); 

// hide "ServiceRequest Add Me To WatchList" for everyone - german
app.custom.formTasks.add('ServiceRequest', null, function (formObj, viewModel) { formObj.boundReady(function () { $( ".taskmenu li:contains('Mich in die Watchlist aufnehmen')" ).hide() }); }); 

// hide "ServiceRequest Assign To Analyst By Group" for everyone - english
app.custom.formTasks.add('ServiceRequest', null, function (formObj, viewModel) {formObj.boundReady(function () {$( ".taskmenu li:contains('Assign To Analyst By Group')" ).hide() }); });
  
// hide "ServiceRequestGruppenbasierte Analysten-Zuweisung" for everyone - german
app.custom.formTasks.add('ServiceRequest', null, function (formObj, viewModel) {formObj.boundReady(function () {$( ".taskmenu li:contains('Gruppenbasierte Analysten-Zuweisung')" ).hide() }); }); 
  
// hide "Bestätigung" for everyone - german
app.custom.formTasks.add('ServiceRequest', null, function (formObj, viewModel) {formObj.boundReady(function () {$( ".taskmenu li:contains('Bestätigung')" ).hide() }); }); 
  
// hide "Acknowledge" for everyone - english
app.custom.formTasks.add('ServiceRequest', null, function (formObj, viewModel) {formObj.boundReady(function () {$( ".taskmenu li:contains('Acknowledge')" ).hide() }); })

// hide "Print" for everyone - english
app.custom.formTasks.add('ServiceRequest', null, function (formObj, viewModel) {formObj.boundReady(function () {$( ".taskmenu li:contains('Print')" ).hide() }); })

/* ----------------------------------------------- */
/* ------------ Customization Community ---------- */
/* ----------------------------------------------- */

// https://community.cireson.com/discussion/comment/7564#Comment_7564
loadScript("/CustomSpace/Customization/SortingRequestOffering/custom_SortingRequestOffering.js",["/SC/ServiceCatalog/RequestOffering/"]);

// https://community.cireson.com/discussion/comment/648#Comment_648
loadScript("/CustomSpace/Customization/BillableTime/custom_AddBillableTime.js",["/Incident/Edit/"]);

// https://community.cireson.com/discussion/comment/16118#Comment_16118
loadScript("/CustomSpace/Customization/GridViewFilter/custom_GridViewFilter.js",['/View/','/Page/']);

// https://community.cireson.com/discussion/comment/14651#Comment_14651
loadScript("/CustomSpace/Customization/Actionlog/custom_ActionLog.js",['/Incident/']);

// https://community.cireson.com/discussion/2096/custom-workitem-preview-on-hover#latest
loadScript("/CustomSpace/Customization/WorkItemPreview/custom_WorkItemPreview.js",['/View/','/Page/']);

// https://community.cireson.com/discussion/1632/active-work-items-badges-on-menu-items/p1
loadScript("/CustomSpace/Customization/WorkItemMenuBadge/custom_WorkItemMenuBadge.js",['/View/','/Page/','/Incident/','/ServiceRequest/']);

// https://community.cireson.com/discussion/59/hide-activity-fields/p1
loadScript("/CustomSpace/Customization/HideActivityFields/custom_HideActivityFields.js",["/ServiceRequest/"]);

//https://community.cireson.com/discussion/1226/add-date-time-created-and-last-modified-to-the-wi-form-easy-visible#latest*/
loadScript("/CustomSpace/Customization/AddDateTimeAndLastModified/AddDateTimeCreatedAndLastModified-Incident.js",["/Incident/"]);

//https://community.cireson.com/discussion/1226/add-date-time-created-and-last-modified-to-the-wi-form-easy-visible#latest*/
loadScript("/CustomSpace/Customization/AddDateTimeAndLastModified/AddDateTimeCreatedAndLastModified-ServiceRequest.js",["/ServiceRequest/"]);

// https://community.cireson.com/discussion/2754/color-coded-priorities
loadScript("/CustomSpace/Customization/ColorPriorities/ColorPriorities.js",["/View/"]);

// loadScript("/CustomSpace/Customization/CancelIR/CancelIR.js",["/Incident"]);
loadScript("/CustomSpace/Customization/ChangeStatus/active.js",["/Incident"]);
loadScript("/CustomSpace/Customization/ChangeStatus/pending-it.js",["/Incident"]);
loadScript("/CustomSpace/Customization/ChangeStatus/pending-customer.js",["/Incident"]);
loadScript("/CustomSpace/Customization/ChangeStatus/Hardware-Service.js",["/Incident"]);
loadScript("/CustomSpace/Customization/ChangeStatus/Resolved.js",["/Incident"]);

loadScript("/CustomSpace/Customization/SinglePrint/custom_singlePrint.js", ["/Incident/", "/ServiceRequest/"]);

/* ===================================================================== */
/* ==================  Incidents-Card (Announcements)  ================= */
/* ===================================================================== */
/* === Nur auf bestimmter Seite Announcements anzeigen === */
(function () {
  var neededUrlPart = "/View/94ecd540-714b-49dc-82d1-0b34bf11888f";
  if (window.location.href.indexOf(neededUrlPart) === -1) {
    // Auf allen anderen Seiten: Announcements sofort verstecken
    var style = document.createElement("style");
    style.textContent = `
      .announcements-wrapper,
      .announcements,
      .announcement-bar,
      #announcement-bar,
      #cpIncidentsCard {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);
  } else {
    console.log("✅ Announcements sind hier erlaubt");
    // Dein bisheriger Announcements-Code darf laufen
  }
})();


(function () {
  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, s => ({
      "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
    }[s]));
  }

  // eure reale Struktur
  function scrapeAnnouncements() {
    const items = [];
    document.querySelectorAll('.announcements-wrapper .announcement-item').forEach(node => {
      const title = (node.querySelector('.announcement-item-heading') || {}).textContent || "";
      const text  = (node.querySelector('.announcement-item-body')   || {}).textContent || "";
      if (title || text) items.push({ title: title.trim() || "Announcement", text: text.trim(), priority: "medium" });
    });
    return items;
  }

 function buildCard(items) {
  const card = document.createElement('section');
  card.className = 'cp-incidents-card' + (items.length ? '' : ' cp-incidents-card--hidden');
  card.id = 'cpIncidentsCard';
  card.innerHTML = `
    <div class="cp-incidents-card__title">
      <span aria-hidden="true">⚠️</span>
      <span>Aktuelle Störungen</span>
    </div>
    <p class="cp-incidents-card__subtitle">Uns sind folgende Beeinträchtigungen bekannt:</p>
    <ul class="cp-incidents-list"></ul>
  `;
  const ul = card.querySelector('.cp-incidents-list');
  items.forEach(it => {
    const dot =
      it.priority === 'high'
        ? 'cp-dot--high'
        : it.priority === 'low'
        ? 'cp-dot--low'
        : 'cp-dot--medium';

    // hier alle "Priority"-Texte rausfiltern (egal ob High, Low, Critical …)
    const cleanTitle = it.title.replace(/\s*(Low|High|Critical)?\s*Priority/i, '').trim();

    const li = document.createElement('li');
    li.innerHTML = `
      <span class="cp-dot ${dot}"></span>
      <div>
        <div class="cp-item-title">${escapeHtml(cleanTitle)}</div>
        ${it.text ? `<p class="cp-item-text">${escapeHtml(it.text)}</p>` : ''}
      </div>`;
    ul.appendChild(li);
  });
  return card;
}

  // gute Ankerstelle finden (unter H1 "Home", sonst #main_wrapper, sonst Container)
function findHomeAnchor() {
  // Kandidaten für die H1
  const h1 =
    Array.from(document.querySelectorAll('#main_wrapper h1, .page-content h1, .container-fluid h1, h1'))
      .find(h => (h.textContent || '').trim().toLowerCase() === 'home') || null;

  // Container: nimm den direkten Parent der H1, sonst typische Wrapper, sonst body
  let container = h1 ? h1.parentElement : null;
  if (!container) {
    const cands = ['#main_wrapper .page-content', '#main_wrapper .container-fluid', '#main_wrapper',
                   '.page-content', '.container-fluid', '.content', 'body'];
    container = cands.map(sel => document.querySelector(sel)).find(Boolean) || document.body;
  }
  return { container, h1 };
}

function placeCard(card) {
  const { container, h1 } = findHomeAnchor();

  // alte Karte entfernen
  const old = document.getElementById('cpIncidentsCard');
  if (old) old.remove();

  // Einfügen: direkt nach der H1, sonst als erstes Kind
  if (h1 && h1.parentElement === container) {
    // nach H1 einfügen
    if (h1.nextSibling) {
      container.insertBefore(card, h1.nextSibling);
    } else {
      container.appendChild(card);
    }
  } else {
    container.insertBefore(card, container.firstChild);
  }
}

  function render() {
    const items = scrapeAnnouncements();
    const card = buildCard(items);
    placeCard(card);
    console.debug('[Incidents] items:', items.length);
  }

  // Slider-UI ausblenden (damit es nicht doppelt ist)
  const hideCSS = document.createElement('style');
  hideCSS.textContent = `.announcements-wrapper, .announcements, .announcements-menu{display:none!important}`;
  document.documentElement.appendChild(hideCSS);

  // robust starten: mehrmals versuchen + auf spätere Änderungen reagieren
  const start = () => {
    let tries = 0;
    const maxTries = 8;         // ~4 Sekunden insgesamt
    const t = setInterval(() => {
      tries++;
      render();
      const count = document.querySelectorAll('.cp-incidents-list li').length;
      if (count > 0 || tries >= maxTries) clearInterval(t);
    }, 500);

    const src = document.querySelector('.announcements-wrapper');
    if (src) {
      const mo = new MutationObserver(render);
      mo.observe(src, { childList: true, subtree: true });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

/* ==== Flag setzen, wenn wirklich Announcements sichtbar sind ==== */
(function () {
  function hasAnnouncementsNow() {
    // gängige Container suchen
    var wrap = document.querySelector('.announcements-wrapper, .announcements');
    if (!wrap) return false;

    // 1) echte Items?
    if (wrap.querySelector('.announcement-item')) return true;

    // 2) Fallback: sichtbare Höhe (manche Themes setzen nur Inline-Height)
    var h = wrap.offsetHeight || wrap.clientHeight || 0;
    return h > 8; // kleiner Schwellenwert, um leere Container auszuschließen
  }

  function updateAnnouncementFlag() {
    var has = hasAnnouncementsNow();
    document.documentElement.classList.toggle('has-announcement', has);
  }

  // initial + verzögert (wg. Lazy-Render)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAnnouncementFlag);
  } else {
    updateAnnouncementFlag();
  }
  window.addEventListener('load', updateAnnouncementFlag);
  setTimeout(updateAnnouncementFlag, 200);
  setTimeout(updateAnnouncementFlag, 800);
  setTimeout(updateAnnouncementFlag, 2000);

  // auf DOM-Änderungen reagieren (Portal lädt später nach)
  var mo = new MutationObserver(function () { updateAnnouncementFlag(); });
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();

(function () {
  var root = document.querySelector('#catalog-area, #catalog_area, .catalog-area');
  if (!root) return;

  document.querySelectorAll('#catalog-area .mini-services, #catalog_area .mini-services, .catalog-area .mini-services')
    .forEach(function (tile) {
      // icon -> into a badge wrapper
      var img = tile.querySelector('img');
      if (img && !img.classList.contains('cp-card__icon')) {
        var wrap = document.createElement('div');
        wrap.className = 'cp-card__icon-wrap';
        img.classList.add('cp-card__icon');
        img.parentNode.insertBefore(wrap, img);
        wrap.appendChild(img);
      }

      // first link -> title
      var links = tile.querySelectorAll('a');
      if (links.length > 0 && !links[0].classList.contains('cp-card__title')) {
        links[0].classList.add('cp-card__title');
      }

      // description heuristic: look for small/label/span/p after the first link
      var maybeDesc = links[0] ? links[0].nextElementSibling : null;
      if (maybeDesc && !maybeDesc.classList.contains('cp-card__actions')) {
        var tag = maybeDesc.tagName;
        if (/^(SMALL|SPAN|LABEL|P|DIV)$/i.test(tag) && !maybeDesc.querySelector('a')) {
          maybeDesc.classList.add('cp-card__subtitle');
        }
      }

      // remaining links -> chips
      if (links.length > 1) {
        var actions = tile.querySelector('.cp-card__actions');
        if (!actions) {
          actions = document.createElement('div');
          actions.className = 'cp-card__actions';
          tile.appendChild(actions);
        }
        for (var i = 1; i < links.length; i++) {
          links[i].classList.add('cp-chip');
          actions.appendChild(links[i]);
        }
      }
    });
})();

(function () {
  // Hilfsfunktion: vorhandene Titel "entklickbar" machen
  function neutralizeCatalogTitles(root = document) {
    // a) Falls ein <a> benutzt wird -> in <span> umwandeln
    root.querySelectorAll('#catalog-area .mini-services a, #catalog_area .mini-services a')
      .forEach(a => {
        const span = document.createElement('span');
        span.className = 'cp-card-title';
        span.textContent = a.textContent.trim();
        a.replaceWith(span);
      });

    // b) Falls Kendo 'click' über <span class="link" data-bind="click: ..."> nutzt -> Binding entfernen
    root.querySelectorAll('#catalog-area .mini-services .link, #catalog_area .mini-services .link')
      .forEach(el => {
        el.removeAttribute('data-bind'); // click-binding entfernen
        el.classList.add('cp-card-title');
        // sicherheitshalber nochmal Events neutralisieren
        el.onclick = null; el.onmouseup = null; el.onmousedown = null;
      });
  }

  // Initial, wenn DOM bereit
  if (document.readyState !== 'loading') {
    neutralizeCatalogTitles();
  } else {
    document.addEventListener('DOMContentLoaded', () => neutralizeCatalogTitles());
  }

  // Da Cireson / Kendo die Liste dynamisch laden kann:
  // MutationObserver auf den Kachelbereich setzen und neu neutralisieren, wenn Inhalte wechseln
  const area = document.getElementById('catalog-area') || document.getElementById('catalog_area');
  if (area) {
    const mo = new MutationObserver(() => neutralizeCatalogTitles(area));
    mo.observe(area, { childList: true, subtree: true });
  }
})();
