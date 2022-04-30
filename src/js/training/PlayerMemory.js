function PlayerMemory() {
    var front = null;
    var back = null;
    var length = 0;

    // Memory Node data immutable
    function MemoryNode(state, reward, action) {
        var state = state;
        var reward = reward;
        var action = action;
        var next = null;

        this.getEvent = function(){
            return {'state': state, 'reward': reward, 'action': action};
        }

        this.getNext = function(){
            return next;
        }

        this.setNext = function(nextNode) {
            next = nextNode;
        }
    }

    this.getLength = function(){
        return length;
    }

    this.deQueue = function(){
        if (length > 0) {
            let frontNode = front;
            front = frontNode.getNext();
            frontNode.setNext(null);
            length -= 1;
            if (length == 0) {
                back = null;
            }
            return frontNode.getData();
        } else {
            return null;
        }
    }

    this.addEvent = function (state, reward, action){
        let newNode = MemoryNode(state, reward, action);
        if (length == 0) {
            front = back = newNode;
        } else {
            let prevBack = back;
            prevBack.setNext(newNode);
            back = newNode;
        }
        length += 1;
    }
}