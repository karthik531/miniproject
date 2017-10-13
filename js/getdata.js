$(document).ready(function(){
    $("#get-data-form").submit(function(e){
        var content = tinymce.get("texteditor").getContent();
        document.getElementById("data-container").innerHTML = content;
        return false;
    });
});