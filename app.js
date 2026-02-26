//Global
let JSONSchedule;
let scheduleParseComplete = false;


document.addEventListener("DOMContentLoaded", function() {
    //  when user change data
    document.getElementById("dateSelect").addEventListener("change", function() {
        // call Timeslot()  reload time slot
        Timeslot();

        //  clean result 
        document.getElementById("result").innerHTML = "";
        document.getElementById("id02").innerHTML = "";
    });

    // change time and date
    document.getElementById("timeSelect").addEventListener("change", function() {
        document.getElementById("result").innerHTML = "";
        document.getElementById("id02").innerHTML = "";
    });
});


// Read JSON file using XMLHttpRequest
let xmlhttp = new XMLHttpRequest();
let url = "scheduling.json";

xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4) {

        if (xmlhttp.status == 200) {
            JSONSchedule = JSON.parse(xmlhttp.responseText);
            scheduleParseComplete = true;
            DateOptions();
            document.getElementById("id02").innerHTML = "JSON loaded successfully.";
        } 
        else {
            document.getElementById("id02").innerHTML = 
                "Error loading JSON file (status: " + xmlhttp.status + ").";
        }
    }
};

xmlhttp.open("GET", url, true);
xmlhttp.send();


//Function to populate date options
//  read json
function DateOptions(){
    let dateSelect = document.getElementById("dateSelect");
    dateSelect.innerHTML = '<option value="">Please select a Date</option>';
    if (!JSONSchedule || JSONSchedule.length === 0){
        document.getElementById("id02").innerHTML = "No data found in JSON.";
        return;
    }

    for (let i = 0; i < JSONSchedule.length; i++){ 
        let opt = document.createElement("option"); 
        let text = JSONSchedule[i].date +" "+ JSONSchedule[i].day ; //check json 
        opt.text = text; // put text into option
        opt.value = i; // ser option value
        dateSelect.appendChild(opt); // slot
    } 
}

// choose time
function Timeslot(){
    // det date and time
    let dateInfo = document.getElementById("dateSelect").value;
    let timeSelect = document.getElementById("timeSelect");
// init
    timeSelect.innerHTML = '<option value="">Please select a time slot</option>';
// if null then stop
    if (dateInfo === ""){
        return;
    }
// id2
    if (!JSONSchedule || !JSONSchedule[dateInfo]){
        document.getElementById("id02").innerHTML = "Invalid date selection.";
        return;
    }
// read json's list (there are 6 days)
    let slots = JSONSchedule[dateInfo].slots;
    let hasSlot = false;

    for (let key of Object.keys(slots)) {
        hasSlot = true;
        let opt = document.createElement("option");
        opt.value = key;
        opt.text = slots[key].time;
        timeSelect.appendChild(opt);
    }

// id2
    if (!hasSlot){
        document.getElementById("id02").innerHTML = "No time slots for this day.";
    } else {
        document.getElementById("id02").innerHTML = "";
    }
}

// clean 
document.getElementById("result").innerHTML = "";
document.getElementById("id02").innerHTML = "";

// show detail (from html)
function showdetail(){
    let dateInfo = document.getElementById("dateSelect").value;
    let slotKey = document.getElementById("timeSelect").value;
    let result = document.getElementById("result");
    
    // id02
    if (dateInfo === "" || slotKey === "") {
        document.getElementById("id02").innerHTML = "Please select both a date and time slot.";
        return;
    }
    
    // clean result
    result.innerHTML = "";
    document.getElementById("id02").innerHTML = "";


    // read json
    let dayInformation = JSONSchedule[dateInfo];
    let slotInformation = dayInformation.slots[slotKey];
    let sessions = slotInformation.sessions;

    // conbine data
    let conference = `<h3>${dayInformation.day} ${dayInformation.date}</h3>`;
    conference += `<h4>Time: ${slotInformation.time}</h4>`;

    // hint 
    if (sessions.length === 0){
        conference += "No sessions scheduled for this slot.";
        result.innerHTML = conference;  
        return;
    }

    // session
    for (let s of sessions) {
        //  submissions（create str）
        let submissionHTML = "";
        if (s.submissions && s.submissions.length > 0) {
            for (let sub of s.submissions) {
                submissionHTML += `
                    <div class="submission">
                        <h3>Title: ${sub.title}</h3>
                        Authors: ${sub.authors.map(a => a.name).join(", ")}<br>
                        DOI Link: <a href="${sub.doiUrl}" target="_blank">${sub.doi}</a>
                    </div>
                `;
            }
        } else {
            submissionHTML = "No submissions available.";
        }

        // session - more info 
        conference += `
            <div class="session-card" data-type="${s.type}">
                <h3>${s.title} </h3>
                Location: ${s.room} <br>
                Type:  ${s.type} <br>
                Time:  ${s.time || slotInformation.time}<br>

                <button onclick="changeInfo(event,'${s.sessionId}')">More Info</button>

                <div id="${s.sessionId}" class="info-box" style="display: none;">
                    ${submissionHTML}
                </div>
            </div>
        `;
    }
        result.innerHTML = conference;
        document.getElementById("filterArea").style.display = "block";

}


// Function to show/hide details inline
function changeInfo(event,id) {
    let space = document.getElementById(id);
    let botton = event.target;

    if (space.style.display === "none") {
        space.style.display = "block";
        botton.innerText = "Hide Info";
    } else {
        space.style.display = "none";
        botton.innerText = "More Info";
    }
}


// filter conference

function filtertype() {
  let filter = document.querySelector('input[name="sessionType"]:checked').value

//   console.log("[v0] type:", filter)

  let sessionCards = document.getElementsByClassName("session-card")

  for (let i = 0; i < sessionCards.length; i++) {
    let card = sessionCards[i]
    let sessionType = card.getAttribute("data-type")

    let shouldShow = false

    if (filter === "all") {
      // reveal every sessions
      shouldShow = true
    } else if (filter === "paper") {
      // type= paper
      shouldShow = sessionType === "paper"
    } else if (filter === "non-paper") {
      // not paper sessions
      shouldShow = sessionType !== "paper"
    }

    if (shouldShow) { card.style.display = "block";
    } else {card.style.display = "none";
    }
  }
}


