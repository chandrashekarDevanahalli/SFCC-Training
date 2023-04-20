class Queue {
    private int[] arr = new int[10];

    int watchman = 0;

    // Add at end of queue O(1)
    public void enque(int value) {
        this.deque();
        this.arr[watchman] = value;
        watchman++;
    }

    // Remove from begenning of queue O(n)
    public int deque() {
        int res = this.arr[0];

        for (int i = 1; i < watchman; i++) {
            this.arr[i - 1] = this.arr[i];
        }
        watchman--;
        return res;
    }
}

class Stack {
    private int[] arr = new int[10];
    int watchman = 0;

    // O(1)
    public void push(int value) {
        this.arr[watchman] = value;
        watchman++;
    }

    // O(1)
    public int pop() {
        int result = this.arr[watchman - 1];
        watchman--;
        return result;
    }
}

public class Test1 {
    public static void main(String[] args) {
        // Queue queue = new Queue();
        // queue.enque(1);
        // queue.enque(6);
        // queue.enque(4);
        //
        // System.out.println(queue.deque());
        // System.out.println(queue.deque());
        // System.out.println(queue.deque());

        // Stack stack = new Stack();
        // stack.push(1);
        // stack.push(6);
        // stack.push(4);
        // System.out.println(stack.pop());
        // System.out.println(stack.pop());
        // System.out.println(stack.pop());

        LinkedList list = new LinkedList();
        list.push("Govind");
        list.push("Ritesh");
        list.push("Ananya");
        list.push("Abnish");

        list.printLinkedList();

    }

}

//////////////////////////////

class Node {
    String value;
    Node next;

    public Node(String value) {
        this.value = value;
    }
}

public class LinkedList {
    int size;
    Node head;
    Node tail;

    public void push(String value) {
        Node node = new Node(value);
        if (size == 0) {
            this.head = node;
            this.tail = node;
        } else {
            this.tail.next = node;
            this.tail = node;
        }
        this.size++;
    }

    public Node pop() {
        if (this.size == 0) {
            return null;
        }

        Node node = this.tail;

        if (this.size == 1) {
            this.head = null;
            this.tail = null;

        } else {
            Node curr = this.head;

            while (curr.next.next != null) {
                curr = curr.next;
            }
            this.tail = curr;
            this.tail.next = null;
        }
        this.size--;
        return node;
    }

    public Node get(int index) {
        int count = 0;
        Node curr = this.head;

        while (curr != null && count < index) {
            curr = curr.next;
            count++;
        }
        if (curr != null) {
            return curr;
        } else
            return null;
    }

    public void set(int index, String value) {
        Node node = this.get(index);
        if (node != null) {
            node.value = value;
        }
    }

    public int search(String value) {
        Node curr = this.head;
        int index = 0;
        while (curr != null) {
            if (curr.value == value) {
                return index;
            } else {
                index++;
                curr = curr.next;
            }
        }
        return -1;
    }

    public int insert(int index, String value) {
        if (index < 0 || index > this.size) {
            return -1;
        }
        if (index == this.size) {
            this.push(value);
            return 1;
        }

        Node newNode = new Node(value);

        Node prevNode = this.get(index - 1);
        Node currNode = prevNode.next;
        newNode.next = currNode;
        prevNode.next = newNode;
        return 1;
    }

    public void printLinkedList() {
        if (this.size == 0) {
            System.out.println("No data found");
            return;
        }
        Node curr = this.head;

        while (curr != null) {
            System.out.print(curr.value + " --> ");
            curr = curr.next;
        }
        System.out.print("Null");
        System.out.println();
    }

}