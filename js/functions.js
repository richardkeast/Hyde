const electron = require('electron');
const {clipboard} = require('electron');
const {webContents} = require('electron');
// const settings = require('electron-settings');
var count = 0;

var clkPref = function (opt) {
  currentValue = opt.value;
  if (currentValue === 'preview') {
    $('#htmlPreview').hide();
    $('#markdown').show();
} else if (currentValue === 'html') {
    $('#markdown').hide();
    $('#htmlPreview').show();
  }
  count = count + 1;
}

var formatHead = function() {
  var edit = $('#editArea');
  var toolbar = $('#toolbarArea');
  var toggle = $('#angleToolBar');
  var menu = $('#appMenu');
  var dragArea = $('#draggable');
  var menuHeight = parseInt(menu.height());
  var editTop = 0;
  if(menu.attr('class') !== 'hidden') {
    toolbar.css({ top: '26px' });
    if($('#toolbarArea:hidden').length === 0) {
      $('#body').css('paddingTop', '30px');
    } else {
      $('#body').css('paddingTop', '0px');
    }
  } else {
    toolbar.css({ top: '0px' });
    if(toolbar.attr('class') !== 'hidden') {
      dragArea.css('width', '50%');
      dragArea.css('left', '50%');
      $('#menuToggle').hide()
    } else {
      dragArea.css('width', '-webkit-calc(100% - 125px)');
      dragArea.css('left', '4%');
      $('#menuToggle').show()
    }
  }
}

var toggleToolbar = function() {
  var toolbar = $('#toolbarArea');
  var toggle = $('#angleToolBar');
  if($('#toolbarArea:hidden').length === 0) {
    toggle.attr('class', 'fa fa-angle-right');
    toggle.css('padding-left', '10px');
    toolbar.css('display', 'none');
  } else {
    toggle.attr('class', 'fa fa-angle-down');
    toggle.css('padding-left', '6px');
    toolbar.css('display', 'block');
  }
  formatHead();
};

function toggleMenu() {
  var menu = $('#appMenu');
  var buttons = $('#metacity').children('button');
  if(menu.attr('class') === 'hidden') {
    menu.attr('class', '');
    menu.css('visibility', 'visible');
    menu.css('height', '26px');
    buttons.css('marginTop', '2px');
    buttons.css('marginBottom', '4px');
    $('#frame').hide()
    $('#draggable-menu').show()
    $('#menuToggle').hide()
    $('#editArea').css('paddingTop', '0px')
  } else {
    menu.attr('class', 'hidden');
    menu.css('visibility', 'hidden');
    menu.css('height', '0px');
    buttons.css('marginTop', '3px');
    buttons.css('marginBottom', '3px');
    $('#frame').show()
    $('#draggable-menu').hide()
    $('#menuToggle').show()
  }
  formatHead();
}

function toggleFullscreen() {
  var electron = require('electron');
  var window = electron.remote.getCurrentWindow();
  if(!window.isFullScreen()) {
    window.setFullScreen(true);
    settings.set('isFullscreen', true);
  } else {
    window.setFullScreen(false);
    settings.set('isFullscreen', false);
  }
}

function toggleDeveloper() {
  var window = electron.remote.getCurrentWindow();
  window.toggleDevTools();
}

function showUnsavedDialog(win) {
  var $modal = jQuery('#unsavedModal'),
      $text = $('#unsavedBody'),
      $filename = $('#bottom-file').text();
  if($('#unsavedModal:hidden').length > 0) {
    if ($filename === 'New document') {
      $filename = 'This document';
    }
    $text.text("'"+$filename.toString()+"' has unsaved changes, do you want to save them?");
    $modal.modal();
  } else {
    $modal.modal('hide');
  }
}

function closeWindow(win) {
  if(!this.isClean()) {
    showUnsavedDialog(win);
  } else {
    win.close();
  }
}

function togglePreview() {
  if(!settings.get('livePreview')) {
    $('#previewPanel').css('display', 'none');
    $("#prevToggle").children().hide();
    $("#htmlRadio").hide();
    $("#previewRadio").hide();
    $('#leftPanel').width('100%');
    $('#rightFade').hide();
    $('#togglePreview').attr('class', 'fa fa-eye-slash');
    settings.set('livePreview', true);
  } else {
    $('#previewPanel').css('display', 'block');
    $("#prevToggle").show();
    $("#prevToggle").children().show();
    $("#htmlRadio").hide();
    $("#previewRadio").hide();
    $('#leftPanel').width('50%');
    $('#rightFade').show();
    $('#togglePreview').attr('class', 'fa fa-eye');
    settings.set('livePreview', false);
  }
}

function toggleSidebar() {
  if(parseInt($('#sidebar').css('left'), 10) < 0) {
    $('#side-button').css('visibility','hidden');
    $('#sidebar').css('left', '0px');
    $('#side-trigger').css('left','250px');
    $('#side-img').attr('src','img/left-arrow.png');
  } else {
    $('#side-button').css('visibility','hidden');
    $('#sidebar').css('left', '-250px');
    $('#side-trigger').css('left','0px');
    $('#side-img').attr('src','img/right-arrow.png');
  }
}


function copySelected() {
  var content = "Text that will be now on the clipboard as text";
  clipboard.writeText(content);
}

function pasteSelected() {
  var content = clipboard.readText();
  alert(content);
}

// function newFile() {
//   electron.remote.getCurrentWindow().webContents.send('file-new');
// }

function openFile() {
  electron.remote.getCurrentWindow().webContents.send('file-open');
}

function saveFile() {
  electron.remote.getCurrentWindow().webContents.send('file-save');
}

function saveFileAs() {
  electron.remote.getCurrentWindow().webContents.send('file-save-as');
}

function exportToPDF() {
  electron.remote.getCurrentWindow().webContents.send('file-pdf');
}

function selectMarkdown() {
  document.getElementById('previewPanel').focus();
}
// Generations and clean state of CodeMirror
var getGeneration = function () {
  return this.cm.doc.changeGeneration();
}

var setClean = function () {
  this.latestGeneration = this.getGeneration();
}

var isClean = function () {
  return this.cm.doc.isClean(this.latestGeneration);
}

// Update window title on various events
var updateWindowTitle = function (path) {
  var appName = "Hyde",
    isClean = this.isClean(),
    saveSymbol = "*",
    parsedPath,
    filename,
    dir,
    title;

  if (path) {
    parsedPath = parsePath(path);
    dir = parsedPath.dirname || process.cwd();
    title = appName + " - " + path.toString();
    filename = parsedPath.basename;
  } else {
    title = appName;
    filename = 'New document';
  }
  if (!this.isClean()) {
    title = saveSymbol + title;
    $('#file-status').css('visibility', 'visible');
  } else {
    $('#file-status').css('visibility', 'hidden');
  }
  document.title = title;
  $('#bottom-file').html(filename);
  $('#bottom-file').title = path.toString();
}

function openSettings() {
    var HydeSettings = require('./js/settingsMenu');
    HydeSettings();
}

function openModal(opt) {
  let win = new remote.BrowserWindow({
    parent: remote.getCurrentWindow(),
    frame: false,
    autoHideMenuBar: true,
    modal: true
  })
  var path = 'file://' + __dirname + '/modal/' + opt.toString() + '.html';
  win.loadURL(path);
}
