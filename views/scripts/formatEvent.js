const formatEvent = (event_name, event_desc, primary_contact_id, start_date, end_date, event_type, estimated_attendance, congregation, setup_time, cleanup_time, public, location_id, visibility_id) => {
    return  {
        "Accounting_Information": null,
        "Allow_Check-in": false,
        "Allow_Self_Checkin": false,
        "Attendee_Message": null,
        "Cancelled": false,
        "Check-in_Information": null,
        "Congregation_ID": parseInt(congregation),
        "Days_Out_to_Remind": null,
        "Description": event_desc,
        "Early_Check-in_Period": null,
        "Event_End_Date": end_date,
        "Event_Start_Date": start_date,
        "Event_Title": event_name,
        "Event_Type_ID": parseInt(event_type),
        "External_Registration_URL": null,
        "Featured_On_Calendar": public,
        "Force_Login": false,
        "Ignore_Program_Groups": false,
        "Late_Check-in_Period": null,
        "Location_ID": parseInt(location_id),
        "Meeting_Instructions": "",
        "Minutes_for_Cleanup": parseInt(cleanup_time),
        "Minutes_for_Setup": parseInt(setup_time),
        "Notification_Settings": null,
        "On_Connection_Card": false,
        "On_Donation_Batch_Tool": false,
        "Online_Meeting_Link": null,
        "Online_Registration_Product": null,
        "Optional_Reminder_Message": null,
        "Other_Event_Information": null,
        "PCO_Connect": null,
        "PCO_Connect_Mode": null,
        "PCO_Plan_ID": null,
        "Parent_Event_ID": null,
        "Participants_Expected": parseInt(estimated_attendance),
        "Primary_Contact": parseInt(primary_contact_id),
        "Priority_ID": null,
        "Program_ID": 1, //We gotta figure out what to do about this
        "Prohibit_Guests": false,
        "Project_Code": null,
        "Public_Website_Settings": null,
        "RSVP_Confirmed_Message": null,
        "Read_More_URL": null,
        "Register_Into_Series": false,
        "Registrant_Message": null,
        "Registration_Active": false,
        "Registration_End": null,
        "Registration_Form": null,
        "Registration_Start": null,
        "Search_Results": 1,
        "Send_To_Heads": false,
        "Tags": null,
        "Visibility_Level_ID": visibility_id,
        "_Approved": false,
        "_Web_Approved": false
    }
}