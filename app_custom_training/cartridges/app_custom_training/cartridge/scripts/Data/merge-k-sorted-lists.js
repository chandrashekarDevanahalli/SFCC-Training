var mergeKLists = function (lists) {
    return partition(lists, 0, lists.length - 1)
};

function partition(lists, start, end) {
    if (start === end) {
        return lists[start];
    }

    if (start < end) {
        let mid = Math.floor((start + end) / 2);
        let l1 = partition(lists, start, mid);
        let l2 = partition(lists, mid + 1, end);

        return mergeTwoLists(l1, l2);
    } else {
        return null;
    }
}

var mergeTwoLists = function (list1, list2) {

    if (!list1) {
        return list2;
    } else if (!list2) {
        return list1;
    }

    let head = new ListNode();
    let curr = head;

    while (list1 && list2) {
        if (list1.val <= list2.val) {
            curr.next = list1;
            curr = curr.next;
            list1 = list1.next;
        } else {
            curr.next = list2;
            curr = curr.next;
            list2 = list2.next;
        }
    }

    if (list1) {
        curr.next = list1;
    }

    if (list2) {
        curr.next = list2;
    }

    return head.next;
};