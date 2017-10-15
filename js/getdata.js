function insertPost(){
    var flag = 0;
	var title_name = document.getElementById("titleID").value.trim().toUpperCase();
    var company_name= document.getElementById("companyID").value.trim().toUpperCase();
    var html_content =  tinymce.get("texteditor").getContent();
    var text_content =  tinymce.get("texteditor").getContent({format: 'text'}).trim(); //to verify if field is empty
    if(title_name == "")
    {
        flag = 1;
        alert("Please enter a valid title...");
        document.getElementById("titleID").value = "";
    }
    if(company_name == "")
    {
        flag = 1;
        alert("Please enter a valid company name...");
        document.getElementById("companyID").value = "";
    }
    if(text_content == "")
    {
        flag = 1;
        alert("Please add experience before submitting...");
        tinymce.get('texteditor').setContent("");
    }
    if(flag == 0)   //all fields correctly entered...so submit
    {
        var user_mail = sessionStorage.getItem("usermail");
	    var user_name = sessionStorage.getItem(user_mail);
        //alert(user_mail);alert(user_name);
        var d = new Date();
        var time_stamp = d.getTime();
        var experience = {
            timestamp: time_stamp,
            usermail: user_mail,
            username: user_name,
            company: company_name,
            title: title_name,
            description: html_content
        };
        var postRef = firebase.firestore().collection("posts").doc();

        postRef.set(experience).then(function(){
            console.log("Document successfully written!");
            alert("Experience successfully saved!");
            var titleID = document.getElementById("titleID").value = "";
            var companyID = document.getElementById("companyID").value = "";
            tinymce.get('texteditor').setContent("");
        }).catch(function(error) {
            console.error("Error writing document: ", error);
        });
    }
}