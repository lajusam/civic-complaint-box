// Solana Smart Contract for Civic Complaint Box
// This contract handles complaint creation, upvoting, and status updates on-chain

use anchor_lang::prelude::*;

declare_id!("YOUR_PROGRAM_ID_HERE");

#[program]
pub mod complaint_contract {
    use super::*;

    // Initialize a new complaint
    pub fn create_complaint(
        ctx: Context<CreateComplaint>,
        ipfs_hash: String,
        category: String,
        location: String,
    ) -> Result<()> {
        let complaint = &mut ctx.accounts.complaint;
        let clock = Clock::get()?;

        complaint.author = ctx.accounts.author.key();
        complaint.ipfs_hash = ipfs_hash;
        complaint.category = category;
        complaint.location = location;
        complaint.created_at = clock.unix_timestamp;
        complaint.upvotes = 0;
        complaint.status = "pending".to_string();

        emit!(ComplaintCreated {
            complaint_id: complaint.key(),
            author: ctx.accounts.author.key(),
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    // Upvote a complaint (one vote per wallet per complaint)
    pub fn upvote_complaint(ctx: Context<UpvoteComplaint>) -> Result<()> {
        let complaint = &mut ctx.accounts.complaint;
        let voter = ctx.accounts.voter.key();

        // Check if user already voted
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

    // Admin only: Update complaint status
    pub fn update_status(ctx: Context<UpdateStatus>, new_status: String) -> Result<()> {
        require!(
            ctx.accounts.admin.key() == ctx.accounts.complaint.admin,
            CustomError::UnauthorizedAdmin
        );

        ctx.accounts.complaint.status = new_status.clone();

        emit!(StatusUpdated {
            complaint_id: ctx.accounts.complaint.key(),
            new_status,
        });

        Ok(())
    }
}

// ============= ACCOUNT STRUCTURES =============

#[account]
pub struct Complaint {
    pub author: Pubkey,
    pub ipfs_hash: String,      // IPFS hash for full complaint text/images
    pub category: String,        // Category of complaint (e.g., "infrastructure", "safety")
    pub location: String,        // Location of complaint
    pub created_at: i64,         // Timestamp when created
    pub upvotes: u32,           // Number of upvotes
    pub voted_by: Vec<Pubkey>,  // List of voters (to prevent double voting)
    pub status: String,          // Current status: "pending", "in_progress", "resolved"
    pub admin: Pubkey,          // Admin address for status updates
}

// ============= INSTRUCTION CONTEXTS =============

#[derive(Accounts)]
pub struct CreateComplaint<'info> {
    #[account(init, payer = author, space = 8 + 32 + 200 + 50 + 100 + 8 + 4 + (32 * 100) + 20 + 32)]
    pub complaint: Account<'info, Complaint>,
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
}

// ============= EVENTS =============

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
    pub new_status: String,
}

// ============= ERROR HANDLING =============

#[error_code]
pub enum CustomError {
    #[msg("User has already voted on this complaint")]
    AlreadyVoted,
    #[msg("Only admin can update status")]
    UnauthorizedAdmin,
}
