/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets, $, window */

define(function (require, exports, module) {
    'use strict';

    var Commands                = brackets.getModule("command/Commands"),
        CommandManager          = brackets.getModule("command/CommandManager"),
        EditorManager           = brackets.getModule("editor/EditorManager"),
        DocumentManager         = brackets.getModule("document/DocumentManager"),
        ExtensionUtils          = brackets.getModule("utils/ExtensionUtils"),
        Menus                   = brackets.getModule("command/Menus");

    var dict;

    require("bjspell/BJSpell");

    //commands
    var VIEW_HIDE_SPELLCHECK = "spellcheck.run";
    
    function _handleSpellcheck() {
        console.log("Running spellcheck");
        /*
        console.log(dict.suggest("spl"));

        dict.replace("This is how I spl words I dn't know hoe to spelll.", function(word) {
            console.log("for spl got "+word);
        });
        */

        var editor = EditorManager.getCurrentFullEditor();
        var cm = editor._codeMirror;

        if (!editor) {
            //_handleShowSpellcheck();
            return;
        }
        var text = editor.document.getText();
        //Taken from BSpell doc
        //text = text.replace(/</g, String.fromCharCode(0));
        console.log("TO SPELL: "+text);

        var modded = dict.replace(text, function(word) {
            console.log("word="+word);
            //where is it?
            var pos = text.indexOf(word);
            console.log("pos is "+pos);
            var cmPos = cm.posFromIndex(pos);
            cm.markText(cmPos, {line:cmPos.line, ch:cmPos.ch+word.length}, "underline");
        });

//console.dir(editor);
//cm.markText({line:1,ch:1},{line:1,ch:3}, "underline");

        return;

                
    }

    //Mainly a wrapper to ensure we have a loaded dictionary
    function _handleShowSpellcheck() {

        //lazy load the init for the dictionary
        if(!dict) {
            console.log("Loading dictionary.");
            dict = new BJSpell(require.toUrl("./BJSpell/en_US.js"), function() {
                _handleSpellcheck();
            });
        } else {
            _handleSpellcheck();
        }
    }
    
    CommandManager.register("Run Spellcheck", VIEW_HIDE_SPELLCHECK, _handleShowSpellcheck);

    function init() {
        
        ExtensionUtils.loadStyleSheet(module, "styles.css");
        

        var menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
        menu.addMenuItem(VIEW_HIDE_SPELLCHECK, "", Menus.AFTER, "menu-view-sidebar");


    }
    
    init();
    
});