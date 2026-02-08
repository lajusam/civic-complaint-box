// Complaint IDL (Interface Definition Language)
// Defines the structure and instructions for the Solana smart contract
// Updated with Role-Based Access Control (RBAC)
// Admin wallet is enforced on-chain — not just in the frontend

export const COMPLAINT_IDL = {
  version: '0.1.0',
  name: 'complaint_contract',
  instructions: [
    // ── Initialize (one-time setup) ──────────────────
    {
      name: 'initialize',
      accounts: [
        {
          name: 'config',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    // ── Create Complaint (any user) ──────────────────
    {
      name: 'createComplaint',
      accounts: [
        {
          name: 'complaint',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'config',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'author',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'ipfsHash',
          type: 'string',
        },
        {
          name: 'category',
          type: 'string',
        },
        {
          name: 'location',
          type: 'string',
        },
      ],
    },
    // ── Upvote Complaint (any user, once per wallet) ─
    {
      name: 'upvoteComplaint',
      accounts: [
        {
          name: 'complaint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'voter',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
    // ── Update Status (ADMIN ONLY — enforced on-chain) ─
    {
      name: 'updateStatus',
      accounts: [
        {
          name: 'complaint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'newStatus',
          type: 'string',
        },
      ],
    },
    // ── Delete Complaint (ADMIN ONLY — enforced on-chain) ─
    {
      name: 'deleteComplaint',
      accounts: [
        {
          name: 'complaint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
    // ── Get Role (read-only check) ───────────────────
    {
      name: 'getRole',
      accounts: [
        {
          name: 'caller',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    // ── Program Config PDA ───────────────────────────
    {
      name: 'ProgramConfig',
      fields: [
        {
          name: 'admin',
          type: 'publicKey',
        },
        {
          name: 'totalComplaints',
          type: 'u64',
        },
        {
          name: 'bump',
          type: 'u8',
        },
      ],
    },
    // ── Complaint Account ────────────────────────────
    {
      name: 'Complaint',
      fields: [
        {
          name: 'author',
          type: 'publicKey',
        },
        {
          name: 'ipfsHash',
          type: 'string',
        },
        {
          name: 'category',
          type: 'string',
        },
        {
          name: 'location',
          type: 'string',
        },
        {
          name: 'createdAt',
          type: 'i64',
        },
        {
          name: 'upvotes',
          type: 'u32',
        },
        {
          name: 'votedBy',
          type: {
            vec: 'publicKey',
          },
        },
        {
          name: 'status',
          type: 'string',
        },
        {
          name: 'admin',
          type: 'publicKey',
        },
      ],
    },
  ],
  events: [
    {
      name: 'ProgramInitialized',
      fields: [
        {
          name: 'admin',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'ComplaintCreated',
      fields: [
        {
          name: 'complaintId',
          type: 'publicKey',
        },
        {
          name: 'author',
          type: 'publicKey',
        },
        {
          name: 'timestamp',
          type: 'i64',
        },
      ],
    },
    {
      name: 'ComplaintUpvoted',
      fields: [
        {
          name: 'complaintId',
          type: 'publicKey',
        },
        {
          name: 'voter',
          type: 'publicKey',
        },
        {
          name: 'totalUpvotes',
          type: 'u32',
        },
      ],
    },
    {
      name: 'StatusUpdated',
      fields: [
        {
          name: 'complaintId',
          type: 'publicKey',
        },
        {
          name: 'admin',
          type: 'publicKey',
        },
        {
          name: 'newStatus',
          type: 'string',
        },
      ],
    },
    {
      name: 'ComplaintDeleted',
      fields: [
        {
          name: 'complaintId',
          type: 'publicKey',
        },
        {
          name: 'admin',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'RoleChecked',
      fields: [
        {
          name: 'wallet',
          type: 'publicKey',
        },
        {
          name: 'role',
          type: 'string',
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'AlreadyVoted',
      msg: 'User has already voted on this complaint',
    },
    {
      code: 6001,
      name: 'UnauthorizedAdmin',
      msg: 'Unauthorized: Only the admin wallet can perform this action',
    },
    {
      code: 6002,
      name: 'InvalidStatus',
      msg: 'Invalid status value. Must be: pending, in_progress, resolved, or rejected',
    },
  ],
};
