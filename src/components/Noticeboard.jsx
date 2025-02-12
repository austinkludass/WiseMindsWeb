import { Box, Typography, useTheme, List, ListItem, ListItemText, Divider } from "@mui/material";
import { tokens } from "../theme";
import { useEffect, useState } from "react";
import { ref, query, limitToLast, onValue } from 'firebase/database';
import { rtdb } from "../data/firebase";

const Noticeboard = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [comments, setComments] = useState([]);

    useEffect(() => {
        const commentsRef = ref(rtdb, "Comments");
        const last10 = query(commentsRef, limitToLast(10));

        const unsub = onValue(last10, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const commentsArray = Object.values(data).sort(
                    (a, b) => new Date(b.TimeStamp).getTime() - new Date(a.TimeStamp).getTime()
                );
                setComments(commentsArray);
            } else {
                setComments([]);
            }
        });

        return () => unsub();
    }, []);

    return (
        <Box
            width="100%"
            height="100%"
            m="0 30px"
            p="20px"
            bgcolor={colors.primary[400]}
            borderRadius="8px"
            overflow="auto"
        >
            <Typography variant="h3" mb="16px" color={colors.orangeAccent[400]}>
                Noticeboard
            </Typography>
            <List>
                {comments.map((comment, index) => (
                    <div key={index}>
                        <ListItem>
                            <ListItemText
                                primary={`${comment.TutorName} (${new Date(comment.TimeStamp).toLocaleString()})`}
                                secondary={comment.Comment}
                            />
                        </ListItem>
                        {index < comments.length - 1 && <Divider />}
                    </div>
                ))}
            </List>
        </Box>
    );
};

export default Noticeboard;
