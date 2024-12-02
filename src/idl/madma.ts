export type Madma = {
  "version": "0.1.0",
  "name": "madma",
  "instructions": [
    {
      "name": "initializeStore",
      "accounts": [
        {
          "name": "store",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createDesign",
      "accounts": [
        {
          "name": "design",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "store",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "imageUrl",
          "type": "string"
        },
        {
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateDesign",
      "accounts": [
        {
          "name": "design",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "store",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "title",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "description",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "imageUrl",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "price",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "available",
          "type": {
            "option": "bool"
          }
        }
      ]
    },
    {
      "name": "toggleDesignAvailability",
      "accounts": [
        {
          "name": "design",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "store",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "createOrder",
      "accounts": [
        {
          "name": "order",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "design",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "store",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "storeAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "shippingInfo",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateOrderStatus",
      "accounts": [
        {
          "name": "order",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "store",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newStatus",
          "type": {
            "defined": "OrderStatus"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "design",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "designId",
            "type": "u64"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "imageUrl",
            "type": "string"
          },
          {
            "name": "available",
            "type": "bool"
          },
          {
            "name": "salesCount",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "order",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "store",
            "type": "publicKey"
          },
          {
            "name": "buyer",
            "type": "publicKey"
          },
          {
            "name": "designId",
            "type": "u64"
          },
          {
            "name": "pricePaid",
            "type": "u64"
          },
          {
            "name": "shippingInfo",
            "type": "string"
          },
          {
            "name": "status",
            "type": {
              "defined": "OrderStatus"
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "store",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "designsCount",
            "type": "u64"
          },
          {
            "name": "earnings",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "OrderStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Created"
          },
          {
            "name": "Pending"
          },
          {
            "name": "Shipped"
          },
          {
            "name": "Delivered"
          },
          {
            "name": "Cancelled"
          },
          {
            "name": "Completed"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidPrice",
      "msg": "Invalid price"
    },
    {
      "code": 6001,
      "name": "DesignNotAvailable",
      "msg": "Design not available"
    },
    {
      "code": 6002,
      "name": "InsufficientPayment",
      "msg": "Insufficient payment"
    },
    {
      "code": 6003,
      "name": "PaymentFailed",
      "msg": "Payment failed"
    },
    {
      "code": 6004,
      "name": "InsufficientBalance",
      "msg": "Insufficient balance"
    },
    {
      "code": 6005,
      "name": "Unauthorized",
      "msg": "Unauthorized"
    },
    {
      "code": 6006,
      "name": "InvalidOrderStatus",
      "msg": "Invalid order status"
    },
    {
      "code": 6007,
      "name": "StoreAlreadyInitialized",
      "msg": "Store already initialized"
    }
  ]
};

export const IDL: Madma = {
  "version": "0.1.0",
  "name": "madma",
  "instructions": [
    {
      "name": "initializeStore",
      "accounts": [
        {
          "name": "store",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createDesign",
      "accounts": [
        {
          "name": "design",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "store",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "imageUrl",
          "type": "string"
        },
        {
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateDesign",
      "accounts": [
        {
          "name": "design",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "store",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "title",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "description",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "imageUrl",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "price",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "available",
          "type": {
            "option": "bool"
          }
        }
      ]
    },
    {
      "name": "toggleDesignAvailability",
      "accounts": [
        {
          "name": "design",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "store",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "createOrder",
      "accounts": [
        {
          "name": "order",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "design",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "store",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "storeAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "shippingInfo",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateOrderStatus",
      "accounts": [
        {
          "name": "order",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "store",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newStatus",
          "type": {
            "defined": "OrderStatus"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "design",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "designId",
            "type": "u64"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "imageUrl",
            "type": "string"
          },
          {
            "name": "available",
            "type": "bool"
          },
          {
            "name": "salesCount",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "order",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "store",
            "type": "publicKey"
          },
          {
            "name": "buyer",
            "type": "publicKey"
          },
          {
            "name": "designId",
            "type": "u64"
          },
          {
            "name": "pricePaid",
            "type": "u64"
          },
          {
            "name": "shippingInfo",
            "type": "string"
          },
          {
            "name": "status",
            "type": {
              "defined": "OrderStatus"
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "store",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "designsCount",
            "type": "u64"
          },
          {
            "name": "earnings",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "OrderStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Created"
          },
          {
            "name": "Pending"
          },
          {
            "name": "Shipped"
          },
          {
            "name": "Delivered"
          },
          {
            "name": "Cancelled"
          },
          {
            "name": "Completed"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidPrice",
      "msg": "Invalid price"
    },
    {
      "code": 6001,
      "name": "DesignNotAvailable",
      "msg": "Design not available"
    },
    {
      "code": 6002,
      "name": "InsufficientPayment",
      "msg": "Insufficient payment"
    },
    {
      "code": 6003,
      "name": "PaymentFailed",
      "msg": "Payment failed"
    },
    {
      "code": 6004,
      "name": "InsufficientBalance",
      "msg": "Insufficient balance"
    },
    {
      "code": 6005,
      "name": "Unauthorized",
      "msg": "Unauthorized"
    },
    {
      "code": 6006,
      "name": "InvalidOrderStatus",
      "msg": "Invalid order status"
    },
    {
      "code": 6007,
      "name": "StoreAlreadyInitialized",
      "msg": "Store already initialized"
    }
  ]
};
