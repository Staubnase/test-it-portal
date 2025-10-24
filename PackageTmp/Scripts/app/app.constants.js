var app = (!app) ? {} : app;

app.constants = {
    workItemTypeIds: {
        SystemWorkItemIncident: "a604b942-4c7b-2fb2-28dc-61dc6f465c68",
        SystemWorkItemServiceRequest: "04b69835-6343-4de2-4b19-6be08c612989",
        SystemWorkItemChangeRequest: "e6c9cf6e-d7fe-1b5d-216c-c3f5d2c7670c",
        SystemWorkItemProblem: "422afc88-5eff-f4c5-f8f6-e01038cde67f",
        SystemWorkItemReleaseRecord: "d02dc3b6-d709-46f8-cb72-452fa5e082b8"
    },
    workItemTypeClassName: {
        SystemWorkItemIncident: "System.WorkItem.Incident",
        SystemWorkItemServiceRequest: "System.WorkItem.ServiceRequest",
        SystemWorkItemChangeRequest: "System.WorkItem.ChangeRequest",
        SystemWorkItemProblem: "System.WorkItem.Problem",
        SystemWorkItemReleaseRecord: "System.WorkItem.ReleaseRecord"
    },
    workItemRootStatusEnum: {
        SystemWorkItemIncident: "89B34802-671E-E422-5E38-7DAE9A413EF8",
        SystemWorkItemServiceRequest: "4E0AB24A-0B46-EFE6-C7D2-5704D95824C7",
        SystemWorkItemChangeRequest: "0BF0A71B-9E9E-F719-0271-C9A4FF352600",
        SystemWorkItemProblem: "56C99A7D-6AC7-AB3C-E6C0-BBF5FE76A65C",
        SystemWorkItemReleaseRecord: "8909CE55-A87F-2D7E-EB64-ABA670596696"
    },
    projectionIds: {
        SystemWorkItemIncidentViewModel: "2d460edd-d5db-bc8c-5be7-45b050cba652",
        SystemWorkItemServiceRequestViewModel: "7ffc8bb7-2c2c-0bd9-bd37-2b463a0f1af7",
        SystemWorkItemChangeRequestViewModel: "4c8f4f06-4c8f-a1b6-c104-89cfb7b593fa",
        SystemWorkItemProblemViewModel: "aa6d17ac-0ed8-5d86-d862-cff4cd8792fa"
    },
    enumPickerIds: {
        ServiceRequestImplementationResults: "4ea37c27-9b24-615a-94da-510539371f4c",
        ServiceRequestSupportGroup : "23c243f6-9365-d46f-dff2-03826e24d228",
        IncidentResolution: "72674491-02cb-1d90-a48f-1b269eb83602",
        IncidentTierQueue: "c3264527-a501-029f-6872-31300080b3bf"
    },
    workItemStatuses: {
        Incident: {
            Id: "89b34802-671e-e422-5e38-7dae9a413ef8",
            Resolved: "2b8830b6-59f0-f574-9c2a-f4b4682f1681",
            Closed: "bd0ae7c4-3315-2eb3-7933-82dfc482dbaf",
            Active: "5e2d3932-ca6d-1515-7310-6f58584df73e",
            Pending: "b6679968-e84e-96fa-1fec-8cd4ab39c3de"
        },
        ServiceRequest: {
            Id: "4e0ab24a-0b46-efe6-c7d2-5704d95824c7",
            Cancelled: "674e87e4-a58e-eab0-9a05-b48881de784c",
            Completed: "b026fdfd-89bd-490b-e1fd-a599c78d440f",
            Submitted: "72b55e17-1c7d-b34c-53ae-f61f8732e425",
            InProgress: "59393f48-d85f-fa6d-2ebe-dcff395d7ed1", 
            OnHold: "05306bf5-a6b9-b5ad-326b-ba4e9724bf37",
            Failed: "21dbfcb4-05f3-fcc0-a58e-a9c48cde3b0e",
            Closed: "c7b65747-f99e-c108-1e17-3c1062138fc4"
        },
        ChangeRequest: {
            Id: "0bf0a71b-9e9e-f719-0271-c9a4ff352600",
            New: "a87c003e-8c19-a25f-f8b2-151b56670e5c",
            Failed: "85f00ead-2603-6c68-dfec-531c83bf900f",
            Closed: "f228d50b-2b5a-010f-b1a4-5c7d95703a9b",
            InProgress: "6d6c64dd-07ac-aaf5-f812-6a7cceb5154d",
            OnHold: "dd6b0870-bcea-1520-993d-9f1337e39d4d",
            Cancelled: "877defb6-0d21-7d19-89d5-a1107d621270",
            Submitted: "504f294c-ae38-2a65-f395-bff4f085698b",
            Completed: "68277330-a0d3-cfdd-298d-d5c31d1d126f",
        },
        Problem: {
            Id:"56c99a7d-6ac7-ab3c-e6c0-bbf5fe76a65c",
            Resolved: "7ff92b06-1694-41e5-2df7-b4d5970d2d2b",
            Closed: "25eac210-e091-8ae8-a713-fea2472f32ff"
        },
        ReleaseRecord: {
            Id: "8909ce55-a87f-2d7e-eb64-aba670596696",
            New: "9b3c924a-3f95-b9d8-6711-42aa8271dd30",
            Closed: "221155fc-ad9f-1e40-c50e-9028ee303137",
            Cancelled: "a000ff0a-2897-4184-73cb-308f533c0dca",
            Completed: "c46ca677-e6c5-afe0-b51e-6aaad1f50e58",
            Failed: "f0073e33-fdda-a1ba-cd93-40b7c88afff4",
            Editing: "f71c86cf-afbd-debf-4464-52fe122b888b",
            OnHold: "bab68d61-1e58-96ff-9f64-33a530fdaf98",
            InProgress: "1840bfdc-3589-88a5-cea9-67536fd95a3b"
        },
        ManualActivity: {
            InProgress: "11fc3cef-15e5-bca4-dee0-9c1155ec8d83",
            Completed: "9de908a1-d8f1-477e-c6a2-62697042b8d9",
            Failed: "144bcd52-a710-2778-2a6e-c62e0c8aae74",
            Cancelled: "89465302-2a23-d2b6-6906-74f03d9b7b41"
        },
        Activity: {
            InProgress: "11fc3cef-15e5-bca4-dee0-9c1155ec8d83",
            Completed: "9de908a1-d8f1-477e-c6a2-62697042b8d9",
            Failed: "144bcd52-a710-2778-2a6e-c62e0c8aae74",
            Cancelled: "89465302-2a23-d2b6-6906-74f03d9b7b41",
            Skipped: "eaec5899-b13c-d107-3e1a-955da6bf9fa7",
            OnHold: "d544258f-24da-1cf3-c230-b057aaa66bed",
            Pending: "50c667cf-84e5-97f8-f6f8-d8acd99f181c",
            Rerun: "baa948b5-cc6a-57d7-4b56-d2012721b2e5"

        }
    },
    workItemPlatformClassName: {
        Incident: "Cached_MT_System_WorkItem_Incident",
        ServiceRequest: "Cached_MT_System_WorkItem_ServiceRequest",
        ChangeRequest: "Cached_MT_System_WorkItem_ChangeRequest",
        Problem: "Cached_MT_System_WorkItem_Problem",
        ReleaseRecord: "Cached_MT_System_WorkItem_ReleaseRecord",
        ReviewActivity: "Cached_MT_System_WorkItem_Activity_ReviewActivity",
        ManualActivity: "Cached_MT_System_WorkItem_Activity_ManualActivity"
    },
};