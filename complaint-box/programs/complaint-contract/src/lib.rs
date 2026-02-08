// Solana Smart Contract for Civic Complaint Box
// Role-Based Access Control (RBAC) using wallet addresses
// Admin wallet is hardcoded and enforced on-chain
// All other wallets are treated as regular users

use anchor_lang::prelude::*;

declare_id!("YOUR_PROGRAM_ID_HERE");

// ============= ADMIN WALLET CONSTANT =============
// This is the single source of truth for admin authorization.
// Only this wallet can call admin-only instructions (e.g., update_status, delete_complaint).
// Change this to your actual admin wallet public key before deployment.
const ADMIN_PUBKEY: &str = "4MMhsQ2odgEdAowV3Si6L44jRhTZAepuFjPeWGSgA3h2";

/// Helper: parse the hardcoded admin pubkey at runtime
fn admin_pubkey() -> Pubkey {
    ADMIN_PUBKEY.parse::<Pubkey>().expect("Invalid ADMIN_PUBKEY constant")
}

#[program]
pub mod complaint_contract {
    use super::*;

    // ── Initialize Program State ────────────────────────
    // Called once after deployment to set up the global config PDA.
    // Stores the admin pubkey on-chain so it can be read by anyone.
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.admin = admin_pubkey();
        config.total_complaints = 0;
        config.bump = ctx.bumps.config;

        emit!(ProgramInitialized {
            admin: config.admin,
        });

        Ok(())
    }

    // ── Create Complaint (any user) ─────────────────────
    // Any connected wallet can file a complaint. No role restriction.
    pub fn create_complaint(
        ctx: Context<CreateComplaint>,
        ipfs_hash: String,
        category: String,
        location: String,
    ) -> Result<()> {
        let complaint = &mut ctx.accounts.complaint;
        let config = &mut ctx.accounts.config;
        let clock = Clock::get()?;

        complaint.author = ctx.accounts.author.key();
        complaint.ipfs_hash = ipfs_hash;
        complaint.category = category;
        complaint.location = location;
        complaint.created_at = clock.unix_timestamp;
        complaint.upvotes = 0;
        complaint.status = "pending".to_string();
        complaint.admin = config.admin; // store admin reference for status checks

        config.total_complaints += 1;

        emit!(ComplaintCreated {
            complaint_id: complaint.key(),
            author: ctx.accounts.author.key(),
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    // ── Upvote Complaint (any user, once per wallet) ────
    // Any wallet can upvote, but only once per complaint.
    pub fn upvote_complaint(ctx: Context<UpvoteComplaint>) -> Result<()> {
        let complaint = &mut ctx.accounts.complaint;
        let voter = ctx.accounts.voter.key();

        // Prevent double voting on-chain
        require!(!complaint.voted_by.contains(&voter), CustomError::AlreadyVoted);

        complaint.upvotes += 1;
        complaint.voted_by.push(voter);

        emit!(ComplaintUpvoted {
            complaint_id: complaint.key(),
            voter,
            total_upvotes: complaint.upvotes,
        });

        Ok(())
    }

    // ── Update Status (ADMIN ONLY) ──────────────────────
    // On-chain enforcement: the signer must match the hardcoded admin pubkey.
    // If any other wallet calls this, the transaction fails with UnauthorizedAdmin.
    pub fn update_status(ctx: Context<UpdateStatus>, new_status: String) -> Result<()> {
        // ── RBAC CHECK: Enforce admin-only access ──
        require!(
            ctx.accounts.admin.key() == admin_pubkey(),
            CustomError::UnauthorizedAdmin
        );

        // Validate status value
        require!(
            matches!(new_status.as_str(), "pending" | "in_progress" | "resolved" | "rejected"),
            CustomError::InvalidStatus
        );

        ctx.accounts.complaint.status = new_status.clone();

        emit!(StatusUpdated {
            complaint_id: ctx.accounts.complaint.key(),
            admin: ctx.accounts.admin.key(),
            new_status,
        });

        Ok(())
    }

    // ── Delete Complaint (ADMIN ONLY) ───────────────────
    // Admin can remove a complaint. The account is closed and rent returned.
    pub fn delete_complaint(ctx: Context<DeleteComplaint>) -> Result<()> {
        // ── RBAC CHECK: Enforce admin-only access ──
        require!(
            ctx.accounts.admin.key() == admin_pubkey(),
            CustomError::UnauthorizedAdmin
        );

        emit!(ComplaintDeleted {
            complaint_id: ctx.accounts.complaint.key(),
            admin: ctx.accounts.admin.key(),
        });

        // Account closure is handled by Anchor's `close` constraint
        Ok(())
    }

    // ── Get Role (read-only helper) ─────────────────────
    // Returns the role of the calling wallet. Not a transaction — just emits an event.
    // Useful for frontends to verify on-chain role without trusting client-side logic.
    pub fn get_role(ctx: Context<GetRole>) -> Result<()> {
        let caller = ctx.accounts.caller.key();
        let role = if caller == admin_pubkey() {
            "admin".to_string()
        } else {
            "user".to_string()
        };

        emit!(RoleChecked {
            wallet: caller,
            role,
        });

        Ok(())
    }
}

// ============= ACCOUNT STRUCTURES =============

/// Global program configuration — stores admin pubkey and stats.
/// PDA seeded with "config" so there's exactly one per program.
#[account]
pub struct ProgramConfig {
    pub admin: Pubkey,            // The admin wallet address
    pub total_complaints: u64,     // Counter for total complaints filed
    pub bump: u8,                  // PDA bump seed
}

#[account]
pub struct Complaint {
    pub author: Pubkey,            // Wallet that filed the complaint
    pub ipfs_hash: String,         // IPFS hash for full complaint data
    pub category: String,          // Category (infrastructure, safety, etc.)
    pub location: String,          // Physical location
    pub created_at: i64,           // Unix timestamp
    pub upvotes: u32,              // Number of upvotes
    pub voted_by: Vec<Pubkey>,     // Voter addresses (prevent double voting)
    pub status: String,            // pending | in_progress | resolved | rejected
    pub admin: Pubkey,             // Admin address for reference
}

// ============= INSTRUCTION CONTEXTS =============

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 1,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, ProgramConfig>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateComplaint<'info> {
    #[account(
        init,
        payer = author,
        space = 8 + 32 + 200 + 50 + 100 + 8 + 4 + (32 * 100) + 20 + 32
    )]
    pub complaint: Account<'info, Complaint>,
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, ProgramConfig>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpvoteComplaint<'info> {
    #[account(mut)]
    pub complaint: Account<'info, Complaint>,
    pub voter: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateStatus<'info> {
    #[account(mut)]
    pub complaint: Account<'info, Complaint>,
    pub admin: Signer<'info>,
    // NOTE: No need to pass config — admin check is against the hardcoded constant
}

#[derive(Accounts)]
pub struct DeleteComplaint<'info> {
    #[account(mut, close = admin)]
    pub complaint: Account<'info, Complaint>,
    #[account(mut)]
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetRole<'info> {
    pub caller: Signer<'info>,
}

// ============= EVENTS =============

#[event]
pub struct ProgramInitialized {
    pub admin: Pubkey,
}

#[event]
pub struct ComplaintCreated {
    pub complaint_id: Pubkey,
    pub author: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ComplaintUpvoted {
    pub complaint_id: Pubkey,
    pub voter: Pubkey,
    pub total_upvotes: u32,
}

#[event]
pub struct StatusUpdated {
    pub complaint_id: Pubkey,
    pub admin: Pubkey,
    pub new_status: String,
}

#[event]
pub struct ComplaintDeleted {
    pub complaint_id: Pubkey,
    pub admin: Pubkey,
}

#[event]
pub struct RoleChecked {
    pub wallet: Pubkey,
    pub role: String,
}

// ============= ERROR HANDLING =============

#[error_code]
pub enum CustomError {
    #[msg("User has already voted on this complaint")]
    AlreadyVoted,

    #[msg("Unauthorized: Only the admin wallet can perform this action")]
    UnauthorizedAdmin,

    #[msg("Invalid status value. Must be: pending, in_progress, resolved, or rejected")]
    InvalidStatus,
}
