
--- question ---

---
legend: Question 2 of 3
---

A project has this script to `ask`{:class="block3sensing"} the user for their name:

```blocks3
when flag clicked
set [name v] to [???] 
ask [What's your name?] and wait 
set [name v] to (answer)
```

![](images/q1-chatbot.png)

What will be the value of the `name`{:class="block3variables"} variable after the player clicks on the tick (checkmark) and the script finishes?

--- choices ---

- ( )  name

  --- feedback ---

No, `name`{:class="block3variables"} is what the variable is called. 

  --- /feedback ---

- ( ) ???
 
  --- feedback ---

No, `???` is the value of the `name`{:class="block3variables"} variable before the `ask`{:class="block3sensing"} block runs.

  --- /feedback ---

- ( ) answer

  --- feedback ---

No, `answer`{:class="block3sensing"} is the built-in variable that Scratch uses to store the answer that a user types when you `ask`{:class="block3sensing"} a question.
  --- /feedback ---

- (x) Bobo

  --- feedback ---

Yes, the `set [name v] to`{:class="block3variables"} block set the **value** of the `name`{:class="block3variables"} variable to the value of `answer`{:class="block3sensing"} which is the text the user entered.

The value `Bobo` will also be shown on the Stage.

  --- /feedback ---

--- /choices ---

--- /question ---
