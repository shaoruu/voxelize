use crate::messages::MessageRecipient;

pub struct Client {
    pub id: String,
    pub recipient: MessageRecipient,
    pub world: Option<String>,
}

impl Client {
    pub fn new(id: String, recipient: MessageRecipient) -> Self {
        Self {
            id,
            recipient,
            world: None,
        }
    }
}