export const testData = {
    empty: [
    ],
    short: [
	{
            "answer": false,
            "id": "user",
            "name": "sfd",
            "question": "sa",
            "room": "sfd",
            "timestamp": 1477865410558.0
	},
	{
            "answer": false,
            "id": "j9BLKevYeVtUwaX0v9YT6o9KulNKrTLO",
            "name": "sdflk",
            "question": "f",
            "room": "f",
            "timestamp": 1477865831165.0
	}
    ],
    long: [
	{
            "answer": false,
            "id": "user",
            "name": "sfd",
            "question": "sa",
            "room": "sfd",
            "timestamp": 1477865410558.0
	},
	{
	    "answer": false,
	    "id": "6OS3hGYf2RvJXLjiopXJrUtqS8F5ZCYX",
	    "name": "sdfjsf",
	    "question": "fsldjk",
	    "room": "fdslj",
	    "timestamp": 1477781783044.0
	},
	{
	    "answer": true,
	    "id": "8r6Kr3yJFzd7jjIncTgMINR2kxSwVa94",
	    "name": "sdf",
	    "question": "dlfjk",
	    "room": "jdfsl",
	    "timestamp": 1477781807954.0
	},
	{
	    "answer": false,
	    "id": "me",
	    "name": "sdk",
	    "question": "ljsdflk",
	    "room": "jlsdfkj",
	    "timestamp": 1477864720325.0
	},
	{
	    "answer": false,
	    "id": "m0EKAjehy+jrDrq937F9QNBBDXVm+sTq",
	    "name": "sdfl",
	    "question": "lsdkfj",
	    "room": "jlkjf",
	    "timestamp": 1477867206078.0
	},
	{
	    "answer": false,
	    "id": "j9BLKevYeVtUwaX0v9YT6o9KulNKrTLO",
	    "name": "slkdfj",
	    "question": "lsfkj",
	    "room": "sfdlkj",
	    "timestamp": 1477868853732.0
	},
	{
	    "answer": false,
	    "id": "kR5SXYEoG4+jwx9T00g8smLE2tksPQW8",
	    "name": "slfdkj",
	    "question": "lkjsdf",
	    "room": "lkdfsj",
	    "timestamp": 1477896565431.0
	}
    ]
};

export const testResponse = {
    empty: {
	"announcement": null,
	"paused": false,
	"queue": [],
	"rev": 1,
	"timestamps": []
    },
    short: {
	"announcement": null,
	"paused": false,
	"queue": [
            {
		"answer": false,
		"id": "user",
		"name": "sfd",
		"question": "sa",
		"room": "sfd"
            },
            {
		"answer": false,
		"id": "j9BLKevYeVtUwaX0v9YT6o9KulNKrTLO",
		"name": "sdflk",
		"question": "f",
		"room": "f"
            }
	],
	"rev": 49,
	"timestamps": [
            1477865410558.0,
            1477865831165.0
	]
    },
    long : {
	"announcement": "hi",
	"paused": false,
	"queue": [
	    {
		"answer": false,
		"id": "user",
		"name": "sfd",
		"question": "sa",
		"room": "sfd"
	    },
	    {
		"answer": false,
		"id": "6OS3hGYf2RvJXLjiopXJrUtqS8F5ZCYX",
		"name": "sdfjsf",
		"question": "fsldjk",
		"room": "fdslj"
	    },
	    {
		"answer": true,
		"id": "8r6Kr3yJFzd7jjIncTgMINR2kxSwVa94",
		"name": "sdf",
		"question": "dlfjk",
		"room": "jdfsl"
	    },
	    {
		"answer": false,
		"id": "me",
		"name": "sdk",
		"question": "ljsdflk",
		"room": "jlsdfkj"
	    },
	    {
		"answer": false,
		"id": "m0EKAjehy+jrDrq937F9QNBBDXVm+sTq",
		"name": "sdfl",
		"question": "lsdkfj",
		"room": "jlkjf"
	    },
	    {
		"answer": false,
		"id": "j9BLKevYeVtUwaX0v9YT6o9KulNKrTLO",
		"name": "slkdfj",
		"question": "lsfkj",
		"room": "sfdlkj"
	    },
	    {
		"answer": false,
		"id": "kR5SXYEoG4+jwx9T00g8smLE2tksPQW8",
		"name": "slfdkj",
		"question": "lkjsdf",
		"room": "lkdfsj"
	    }
	],
	"rev": 189,
	"timestamps": [
	    1477865410558.0,
            1477781783044.0,
            1477781807954.0,
	    1477864720325.0,
            1477867206078.0,
            1477868853732.0,
            1477896565431.0
	]
    }
};
