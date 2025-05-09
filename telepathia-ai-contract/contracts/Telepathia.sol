// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Telepathia {
    struct UserProfile {
        string username;
        string publicKey;
        uint256 lastSeen;
        bool isRegistered;
    }
    
    struct DirectMessage {
        uint256 id;
        address sender;
        address receiver;
        string encryptedContent;
        uint256 timestamp;
        bool isRead;
    }
    
    struct Message {
        uint256 id;
        address sender;
        string encryptedContent;
        uint256 timestamp;
        address[] readBy;
    }
    
    struct Thread {
        uint256 id;
        string name;
        address creator;
        bool isGroup;
        uint256 createdAt;
        address[] participants;
    }
    
    address public owner;
    uint256 private nextMessageId = 1;
    uint256 private nextThreadId = 1;
    mapping(address => UserProfile) private userProfiles;
    mapping(address => uint256[]) private userMessages;
    mapping(uint256 => Thread) private threads;
    mapping(uint256 => Message[]) private threadMessages;
    mapping(address => mapping(address => uint256[])) private directMessageIds;
    mapping(uint256 => DirectMessage) private directMessages;
    mapping(address => uint256[]) private userThreads;
    mapping(address => uint256) private unreadMessageCounts;
    
    event UserRegistered(
        address indexed user,
        string username,
        string publicKey
    );
    
    event MessageSent(
        address indexed sender,
        address indexed receiver,
        uint256 messageId,
        string encryptedContent,
        uint256 timestamp
    );
    
    event ThreadCreated(
        address indexed creator,
        uint256 threadId,
        string name,
        bool isGroup
    );
    
    event ThreadJoined(
        uint256 indexed threadId,
        address indexed participant
    );
    
    event MessageRead(
        uint256 indexed messageId,
        address indexed reader,
        uint256 timestamp
    );

    modifier onlyRegistered() {
        require(userProfiles[msg.sender].isRegistered, "User not registered");
        _;
    }
    
    modifier threadExists(uint256 _threadId) {
        require(threads[_threadId].creator != address(0), "Thread does not exist");
        _;
    }
    
    modifier isThreadParticipant(uint256 _threadId) {
        bool isParticipant = false;
        address[] memory participants = threads[_threadId].participants;
        
        for (uint i = 0; i < participants.length; i++) {
            if (participants[i] == msg.sender) {
                isParticipant = true;
                break;
            }
        }
        
        require(isParticipant, "Not a thread participant");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function registerUser(string calldata _username, string calldata _publicKey) external {
        require(!userProfiles[msg.sender].isRegistered, "User already registered");
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(bytes(_publicKey).length > 0, "Public key cannot be empty");
        
        userProfiles[msg.sender] = UserProfile({
            username: _username,
            publicKey: _publicKey,
            lastSeen: block.timestamp,
            isRegistered: true
        });
        
        emit UserRegistered(msg.sender, _username, _publicKey);
    }
    
    function updateLastSeen() external onlyRegistered {
        userProfiles[msg.sender].lastSeen = block.timestamp;
    }
    
    function updatePublicKey(string calldata _newPublicKey) external onlyRegistered {
        require(bytes(_newPublicKey).length > 0, "Public key cannot be empty");
        userProfiles[msg.sender].publicKey = _newPublicKey;
    }
    
    function getUserProfile(address _userAddress) external view returns (UserProfile memory) {
        return userProfiles[_userAddress];
    }
    
    function sendDirectMessage(address _receiver, string calldata _encryptedContent) 
        external 
        onlyRegistered 
        returns (uint256) 
    {
        require(_receiver != address(0), "Invalid receiver address");
        require(_receiver != msg.sender, "Cannot send message to self");
        require(bytes(_encryptedContent).length > 0, "Message cannot be empty");
        require(userProfiles[_receiver].isRegistered, "Receiver not registered");
        
        uint256 messageId = nextMessageId++;
        
        DirectMessage memory newMessage = DirectMessage({
            id: messageId,
            sender: msg.sender,
            receiver: _receiver,
            encryptedContent: _encryptedContent,
            timestamp: block.timestamp,
            isRead: false
        });
        
        directMessages[messageId] = newMessage;
        directMessageIds[msg.sender][_receiver].push(messageId);
        directMessageIds[_receiver][msg.sender].push(messageId);
        
        unreadMessageCounts[_receiver]++;
        
        emit MessageSent(msg.sender, _receiver, messageId, _encryptedContent, block.timestamp);
        
        return messageId;
    }
    
    function markMessageAsRead(uint256 _messageId) external onlyRegistered {
        DirectMessage storage message = directMessages[_messageId];
        
        if (message.receiver == msg.sender && !message.isRead) {
            message.isRead = true;
            
            if (unreadMessageCounts[msg.sender] > 0) {
                unreadMessageCounts[msg.sender]--;
            }
            
            emit MessageRead(_messageId, msg.sender, block.timestamp);
            return;
        }
        
        for (uint256 i = 1; i < nextThreadId; i++) {
            Message[] storage messages = threadMessages[i];
            
            for (uint256 j = 0; j < messages.length; j++) {
                if (messages[j].id == _messageId) {
                    bool isParticipant = false;
                    for (uint256 k = 0; k < threads[i].participants.length; k++) {
                        if (threads[i].participants[k] == msg.sender) {
                            isParticipant = true;
                            break;
                        }
                    }
                    
                    require(isParticipant, "Not authorized to mark this message");
                    
                    bool alreadyRead = false;
                    for (uint256 k = 0; k < messages[j].readBy.length; k++) {
                        if (messages[j].readBy[k] == msg.sender) {
                            alreadyRead = true;
                            break;
                        }
                    }
                    
                    if (!alreadyRead) {
                        messages[j].readBy.push(msg.sender);
                        
                        if (unreadMessageCounts[msg.sender] > 0) {
                            unreadMessageCounts[msg.sender]--;
                        }
                        
                        emit MessageRead(_messageId, msg.sender, block.timestamp);
                    }
                    
                    return;
                }
            }
        }
        
        revert("Message not found");
    }
    
    function getUnreadMessageCount(address _userAddress) external view returns (uint256) {
        return unreadMessageCounts[_userAddress];
    }
    
    function getDirectMessages(
        address _user1,
        address _user2,
        uint256 _fromIndex,
        uint256 _count
    ) 
        external 
        view 
        returns (DirectMessage[] memory) 
    {
        uint256[] storage ids = directMessageIds[_user1][_user2];
        
        uint256 resultCount = _count;
        if (_fromIndex >= ids.length) {
            resultCount = 0;
        } else if (_fromIndex + _count > ids.length) {
            resultCount = ids.length - _fromIndex;
        }
        
        DirectMessage[] memory result = new DirectMessage[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            uint256 index = ids.length - 1 - (_fromIndex + i);
            result[i] = directMessages[ids[index]];
        }
        
        return result;
    }
    
    function createThread(
        string calldata _name,
        bool _isGroup,
        address[] calldata _initialParticipants
    ) 
        external 
        onlyRegistered 
        returns (uint256) 
    {
        require(bytes(_name).length > 0, "Thread name cannot be empty");
        
        if (!_isGroup) {
            require(_initialParticipants.length == 1, "Direct chat requires exactly one participant");
            require(_initialParticipants[0] != msg.sender, "Cannot create direct chat with self");
            require(userProfiles[_initialParticipants[0]].isRegistered, "Participant not registered");
        }
        
        uint256 threadId = nextThreadId++;
        
        address[] memory allParticipants = new address[](_initialParticipants.length + 1);
        allParticipants[0] = msg.sender;
        
        for (uint256 i = 0; i < _initialParticipants.length; i++) {
            require(_initialParticipants[i] != address(0), "Invalid participant address");
            allParticipants[i + 1] = _initialParticipants[i];
        }
        
        threads[threadId] = Thread({
            id: threadId,
            name: _name,
            creator: msg.sender,
            isGroup: _isGroup,
            createdAt: block.timestamp,
            participants: allParticipants
        });
        
        userThreads[msg.sender].push(threadId);
        for (uint256 i = 0; i < _initialParticipants.length; i++) {
            if (userProfiles[_initialParticipants[i]].isRegistered) {
                userThreads[_initialParticipants[i]].push(threadId);
            }
        }
        
        emit ThreadCreated(msg.sender, threadId, _name, _isGroup);
        
        return threadId;
    }
    
    function joinThread(uint256 _threadId) 
        external 
        onlyRegistered 
        threadExists(_threadId) 
    {
        Thread storage thread = threads[_threadId];
        
        for (uint256 i = 0; i < thread.participants.length; i++) {
            if (thread.participants[i] == msg.sender) {
                revert("Already a participant");
            }
        }
        
        require(thread.isGroup, "Cannot join direct thread");
        
        thread.participants.push(msg.sender);
        userThreads[msg.sender].push(_threadId);
        
        emit ThreadJoined(_threadId, msg.sender);
    }
    
    function sendThreadMessage(uint256 _threadId, string calldata _encryptedContent) 
        external 
        onlyRegistered 
        threadExists(_threadId)
        isThreadParticipant(_threadId)
        returns (uint256) 
    {
        require(bytes(_encryptedContent).length > 0, "Message cannot be empty");
        
        uint256 messageId = nextMessageId++;
        
        address[] memory readBy = new address[](1);
        readBy[0] = msg.sender;
        
        Message memory newMessage = Message({
            id: messageId,
            sender: msg.sender,
            encryptedContent: _encryptedContent,
            timestamp: block.timestamp,
            readBy: readBy
        });
        
        threadMessages[_threadId].push(newMessage);
        
        Thread storage thread = threads[_threadId];
        for (uint256 i = 0; i < thread.participants.length; i++) {
            if (thread.participants[i] != msg.sender) {
                unreadMessageCounts[thread.participants[i]]++;
            }
        }
        
        emit MessageSent(msg.sender, thread.creator, messageId, _encryptedContent, block.timestamp);
        
        return messageId;
    }
    
    function getUserThreads(address _userAddress) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userThreads[_userAddress];
    }
    
    function getThreadInfo(uint256 _threadId) 
        external 
        view 
        threadExists(_threadId) 
        returns (Thread memory) 
    {
        return threads[_threadId];
    }
    
    function getThreadMessages(
        uint256 _threadId,
        uint256 _fromIndex,
        uint256 _count
    ) 
        external 
        view 
        threadExists(_threadId) 
        returns (Message[] memory) 
    {
        Message[] storage messages = threadMessages[_threadId];
        
        uint256 resultCount = _count;
        if (_fromIndex >= messages.length) {
            resultCount = 0;
        } else if (_fromIndex + _count > messages.length) {
            resultCount = messages.length - _fromIndex;
        }
        
        Message[] memory result = new Message[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            uint256 index = messages.length - 1 - (_fromIndex + i);
            result[i] = messages[index];
        }
        
        return result;
    }
}