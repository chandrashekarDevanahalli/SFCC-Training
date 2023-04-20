class Node {
    String value;
    Node next;
    Node prev;

    public Node(String value) {
        this.value = value;
    }
}

public class DoublyLinkedList {
    int size;
    Node head;
    Node tail;

    public void push(String val) {
        Node node = new Node(val);
        if (this.size == 0) {
            this.head = node;
            this.tail = node;
        } else {
            this.tail.next = node;
            node.prev = this.tail;
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
            this.tail = this.tail.prev;
            this.tail.next = null;
        }
        this.size--;

        node.prev = null;
        return node;
    }

    // Remove from begenning
    public Node shift() {
        if (this.size == 0) {
            return null;
        }
        Node node = this.head;
        if (this.size == 1) {
            this.head = null;
            this.tail = null;
        } else {
            this.head = this.head.next;
            node.next = null;
            this.head.prev = null;
        }

        this.size--;
        return node;
    }

    // Inserting at begenning
    public void unshift(String val) {
        Node node = new Node(val);

        if (this.size == 0) {
            this.head = node;
            this.tail = node;
        } else {
            node.next = this.head;
            this.head.prev = node;
            this.head = node;
        }
        this.size++;
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

    public int insert(int index, String value) {
        if (index < 0 || index > this.size) {
            return -1;
        }
        if (index == this.size) {
            this.push(value);
            return 1;
        }

        if (index == 0) {
            this.unshift(value);
            return 1;
        }

        Node newNode = new Node(value);

        Node currNode = this.get(index);

        newNode.prev = currNode.prev;
        currNode.prev.next = newNode;
        currNode.prev = newNode;
        newNode.next = currNode;

        this.size++;
        return 1;
    }

    public void printDoublyLinkedList() {
        if (this.size == 0) {
            System.out.println("No data found");
            return;
        }
        Node curr = this.head;

        System.out.print("Null <--> ");
        while (curr != null) {
            System.out.print(curr.value + " <--> ");
            curr = curr.next;
        }
        System.out.print("Null");
        System.out.println();
    }
}