import Conversation from "../model/conversations.js";
import { Message } from "../model/messages.js";

export const saveConversation = async (req,res)=>{

    try {

        const {title} = req.body;

    const conversation = await Conversation.create({title});

    console.log("conversation created")

    res.json({
        id: conversation._id,
        title: conversation.title
    });
        
    } catch (error) {

        res.json(error.message);


        
    }
}

export const getConversation = async (req,res)=>{

    try {

        const {id} = req.params;
        console.log(id)
        const conversations = await Message.find({conversationId: id}).sort({createdAt: 1});

    console.log(conversations);

    res.json(conversations);

    } catch (error) {

        res.json(error);
        
    }
    
}

export const getAllConversation = async (req,res)=>{

    try {

        
        const conversations = await Conversation.find();

    

    res.json(conversations);

    } catch (error) {

        res.json(error);
        
    }
    
}

export const deleteConversation = async (req,res)=>{

    try {

        const {conversationId} = req.params;

        console.log("this is the deleted conversation id", conversationId);

    const conversation = await Conversation.findByIdAndDelete(conversationId);

    const messages = await Message.deleteMany({
        conversationId: conversationId
    });

    res.json({
        message: "the conversation is deleted"

    })
        
    } catch (error) {

        console.log("this is the error", error)

        res.json({
            message: "failed to delete the conversation"
        })
        
    }


}