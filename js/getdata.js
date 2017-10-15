function insertPost(){
    //var flag = 0;
	var title_name = document.getElementById("titleID").value.toUpperCase();
    var company_name= document.getElementById("companyID").value.toUpperCase();
    /*if(title_name == "")
    {
        flag = 1;
        alert("Please enter a valid title...");
    }
    if(company_name == "")
    {
        flag = 1;
        alert("Please enter a valid company name...");
    }*/
    //if(flag == 0)
    //{
        var user_mail = sessionStorage.getItem("usermail");
	    var user_name = sessionStorage.getItem(user_mail);
        alert(user_mail);alert(user_name);
        var content =  tinymce.get("texteditor").getContent()
        var d = new Date();
        var time_stamp = d.getTime();
        var experience = {
            timestamp: time_stamp,
            usermail: user_mail,
            username: user_name,
            company: company_name,
            title: title_name,
            description: content
        };
        var postRef = firebase.firestore().collection("posts").doc();

        postRef.set(experience).then(function(){
            console.log("Document successfully written!");
        }).catch(function(error) {
        console.error("Error writing document: ", error);
        });
    //}
}