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
            _handleShowSpellcheck();
            return;
        }
        var text = editor.document.getText();
        //Taken from BSpell doc
        //text = text.replace(/</g, String.fromCharCode(0));
        console.log("TO SPELL: "+text);

        var modded = dict.replace(text, function(word) {
            console.log("word="+word);
            return "<span class='underline'>"+word+"</span>";
        });
//console.log(modded);
console.dir(editor);
cm.markText({line:1,ch:1},{line:1,ch:3}, "underline");

        return;

        results = CSSLint.verify(text);
        messages = results.messages;
                
        if (results.messages.length) {

            var $csslintTable = $("<table class='zebra-striped condensed-table' style='table-layout: fixed; width: 100%'>").append("<tbody>");
            $("<tr><th>Line</th><th>Declaration</th><th>Type</th><th>Message</th></tr>").appendTo($csslintTable);

            var $selectedRow;
            
            results.messages.forEach(function (item) {
                var makeCell = function (content) {
                    return $("<td style='word-wrap: break-word' />").text(content);
                };

                //sometimes line is blank, as is evidence
                if (!item.line) { item.line = ""; }
                if (!item.evidence) { item.evidence = ""; }

                var $row = $("<tr/>")
                            .append(makeCell(item.line))
                            .append(makeCell(item.evidence))
                            .append(makeCell(item.type))
                            .append(makeCell(item.message))
                            .appendTo($csslintTable);
                $row.click(function () {
                    if ($selectedRow) {
                        $selectedRow.removeClass("selected");
                    }
                    $row.addClass("selected");
                    $selectedRow = $row;

                    var editor = EditorManager.getCurrentFullEditor();
                    editor.setCursorPos(item.line - 1, item.col - 1);
                    EditorManager.focusEditor();
                });

            });

            $("#csslint .table-container")
                .empty()
                .append($csslintTable);
                
        } else {
            //todo - tell the user no issues
            $("#csslint .table-container")
                .empty()
                .append("<p>No issues.</p>");
        }
    }

    function _handleShowSpellcheck() {

        var $panel = $("#spellcheckpanel");

        //lazy load the init for the dictionary
        if(!dict) {
            console.log("Loading dictionary.");
            dict = new BJSpell(require.toUrl("./BJSpell/en_US.js"), function() {

                if ($panel.css("display") !== "none") {
                    _handleSpellcheck();
                }

            });
        }

        
        if ($panel.css("display") === "none") {
            $panel.show();
            CommandManager.get(VIEW_HIDE_SPELLCHECK).setChecked(true);
            $(DocumentManager).on("currentDocumentChange documentSaved", _handleSpellcheck);
        } else {
            $panel.hide();
            CommandManager.get(VIEW_HIDE_SPELLCHECK).setChecked(false);
            $(DocumentManager).off("currentDocumentChange documentSaved", null,  _handleSpellcheck);
        }
        EditorManager.resizeEditor();

    }
    
    CommandManager.register("Run Spellcheck", VIEW_HIDE_SPELLCHECK, _handleShowSpellcheck);

    function init() {
        
        ExtensionUtils.loadStyleSheet(module, "styles.css");
        
        var menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
        menu.addMenuItem(VIEW_HIDE_SPELLCHECK, "", Menus.AFTER, "menu-view-sidebar");


    }
    
    init();
    
});